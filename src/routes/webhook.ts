import express, { Request, Response } from "express";
import crypto from "crypto";
import { BaseResponse } from "../types/response";
import UserBioData from "../models/userBioData";

const Router = express.Router();

/**
 * Verify RevenueCat webhook signature
 * This ensures the webhook actually came from RevenueCat and wasn't forged
 */
const verifyRevenueCatSignature = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  try {
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest("hex");
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
};

/**
 * POST /webhook/revenuecat
 * 
 * Handles RevenueCat webhook events
 * Primary event: NON_RENEWING_PURCHASE (when user completes a one-time purchase)
 * 
 * Flow:
 * 1. Verify webhook signature for security
 * 2. Parse the webhook payload
 * 3. Extract transaction details
 * 4. Find the biodata entry using app_user_id (format: userId_biodataId)
 * 5. Update payment status and store transaction details
 * 6. Mark as ready for PDF generation
 */
Router.post("/revenuecat", async (req: Request, res: Response) => {
  try {
    console.log("📥 RevenueCat webhook received");
    
    // Get the raw body as string for signature verification
    const rawBody = JSON.stringify(req.body);
    
    // Get signature from headers
    const signature = req.headers["x-revenuecat-signature"] as string;
    
    // Get webhook secret from environment variables
    const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error("❌ REVENUECAT_WEBHOOK_SECRET not configured");
      return res.status(500).json({ 
        error: "Webhook secret not configured" 
      });
    }

    // Verify signature (CRITICAL for security)
    if (signature && !verifyRevenueCatSignature(rawBody, signature, webhookSecret)) {
      console.error("❌ Invalid webhook signature");
      return res.status(401).json({ 
        error: "Invalid signature" 
      });
    }

    const webhookData = req.body;
    const eventType = webhookData.event?.type;

    console.log(`📝 Event type: ${eventType}`);

    // We only care about NON_RENEWING_PURCHASE events for one-time purchases
    if (eventType !== "NON_RENEWING_PURCHASE") {
      console.log(`ℹ️ Ignoring event type: ${eventType}`);
      return res.status(200).json({ 
        message: "Event type not handled" 
      });
    }

    // Extract important data from webhook
    const {
      app_user_id,
      transaction_id,
      product_id,
      price,
      currency,
      purchased_at_ms,
    } = webhookData.event;

    console.log(`💳 Transaction ID: ${transaction_id}`);
    console.log(`👤 App User ID: ${app_user_id}`);
    console.log(`📦 Product ID: ${product_id}`);

    // Check if transaction already processed (webhook can fire multiple times)
    const existingTransaction = await UserBioData.findOne({
      revenuecat_transaction_id: transaction_id,
    });

    if (existingTransaction) {
      console.log(`⚠️ Transaction already processed: ${transaction_id}`);
      return res.status(200).json({ 
        message: "Transaction already processed" 
      });
    }

    // Parse app_user_id to extract biodata_id
    // Format: "firebase_uid_biodataId" or just "biodataId"
    let biodataId: string | null = null;
    let userId: string | null = null;

    // Try to parse the app_user_id
    // Expected format: userId_biodataId
    const parts = app_user_id.split("_");
    if (parts.length >= 2) {
      // Last part is biodata ID
      biodataId = parts[parts.length - 1];
      // Everything before last underscore is user ID
      userId = parts.slice(0, -1).join("_");
    } else {
      biodataId = app_user_id;
    }

    console.log(`🔍 Looking for biodata ID: ${biodataId}`);

    // Find the biodata entry
    let biodata = await UserBioData.findById(biodataId);

    if (!biodata) {
      console.error(`❌ Biodata not found for ID: ${biodataId}`);
      // Still return 200 to acknowledge receipt
      return res.status(200).json({ 
        error: "Biodata not found",
        biodata_id: biodataId 
      });
    }

    // Verify user_id matches if we parsed it
    if (userId && biodata.user_id !== userId) {
      console.error(`❌ User ID mismatch. Expected: ${biodata.user_id}, Got: ${userId}`);
      return res.status(200).json({ 
        error: "User ID mismatch" 
      });
    }

    // Check if already paid (safety check)
    if (biodata.payment_status === "PAYMENT_SUCCESS") {
      console.log(`⚠️ Biodata already marked as paid: ${biodataId}`);
      return res.status(200).json({ 
        message: "Already marked as paid" 
      });
    }

    console.log(`✅ Updating payment status for biodata: ${biodataId}`);

    // Update the biodata with payment information
    biodata.payment_status = "PAYMENT_SUCCESS";
    biodata.pgType = "REVENUECAT";
    biodata.revenuecat_transaction_id = transaction_id;
    biodata.revenuecat_app_user_id = app_user_id;
    biodata.revenuecat_product_id = product_id;
    biodata.revenuecat_webhook_event_type = eventType;
    biodata.revenuecat_webhook_received_at = new Date();
    biodata.revenuecat_webhook_payload = webhookData;
    biodata.pg_response_credt = new Date();
    biodata.pg_response = {
      transaction_id,
      product_id,
      price,
      currency,
      purchased_at: new Date(purchased_at_ms),
    };

    // Update amount if provided
    if (price) {
      biodata.amount = price;
    }
    if (currency) {
      biodata.currency = currency as "INR" | "USD";
    }

    await biodata.save();

    console.log(`🎉 Payment successfully processed for biodata: ${biodataId}`);

    // Return 200 to acknowledge webhook
    res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
      biodata_id: biodataId,
      transaction_id,
    });

  } catch (error: any) {
    console.error("❌ Error processing webhook:", error);
    
    // Still return 200 to prevent RevenueCat from retrying
    // Log the error for investigation
    res.status(200).json({
      error: "Internal error processing webhook",
      message: error.message,
    });
  }
});

export { Router };

