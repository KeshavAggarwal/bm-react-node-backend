import express, { Response } from "express";
import { BaseResponse } from "../types/response";
import { authenticateFirebase, AuthenticatedRequest } from "../middleware/authMiddleware";
import UserBioData from "../models/userBioData";
import { loadTemplate } from "../utils";
import { ITemplateProps } from "../types/templateTypes";
import mongoose from "mongoose";

// RevenueCat configuration
const REVENUECAT_API_KEY = process.env.REVENUECAT_API_KEY;
const REVENUECAT_PROJECT_ID = process.env.REVENUECAT_PROJECT_ID;

// Function to verify purchase with RevenueCat
async function verifyRevenueCatPurchase(transactionId: string): Promise<{
  verified: boolean;
  data: any;
  error: string | null;
}> {
  if (!REVENUECAT_API_KEY || !REVENUECAT_PROJECT_ID) {
    return { verified: false, data: null, error: "RevenueCat configuration is missing" };
  }

  try {
    const url = `https://api.revenuecat.com/v2/projects/${REVENUECAT_PROJECT_ID}/purchases?store_purchase_identifier=${encodeURIComponent(transactionId)}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${REVENUECAT_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("RevenueCat API error:", response.status, errorText);
      return { verified: false, data: null, error: `RevenueCat API error: ${response.status}` };
    }

    const data = await response.json();
    
    // Verify that the transaction ID exists in the response
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return { verified: false, data: null, error: "No purchases found for this transaction ID" };
    }
    
    // Check if any purchase matches the transaction ID
    const matchedPurchase = data.items.find(
      (item: any) => 
        item.id === transactionId || 
        String(item.store_purchase_identifier) === transactionId
    );
    
    if (!matchedPurchase) {
      return { verified: false, data: null, error: "Transaction ID does not match any purchase in the response" };
    }
    
    return { verified: true, data, error: null };
  } catch (error: any) {
    console.error("Error verifying RevenueCat purchase:", error);
    return { verified: false, data: null, error: error.message || "Unknown error" };
  }
}

const Router = express.Router();

// Valid channels
const VALID_CHANNELS = ["ANDROID", "IOS", "WEB"] as const;
type Channel = typeof VALID_CHANNELS[number];

// POST /biodata/create - Create a new biodata entry
Router.post("/create", authenticateFirebase, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: {
          message: "User ID not found in token",
          code: 400,
        },
      };
      return res.status(400).json(response);
    }

    const { tId, fd, imagePath, channel, amount = 0, currency = "INR" } = req.body;

    // Validate fd is not null or empty
    if (!fd || (typeof fd === "object" && Object.keys(fd).length === 0)) {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: {
          message: "Form data (fd) is required and cannot be empty",
          code: 400,
        },
      };
      return res.status(400).json(response);
    }

    // Validate template_id
    if (!tId) {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: {
          message: "Template ID is required",
          code: 400,
        },
      };
      return res.status(400).json(response);
    }

    // Validate channel
    if (!channel || !VALID_CHANNELS.includes(channel)) {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: {
          message: `Invalid channel`,
          code: 400,
        },
      };
      return res.status(400).json(response);
    }

    // Create new biodata entry
    const newBiodata = new UserBioData({
      user_id: userId,
      template_id: tId,
      form_data: fd,
      image_path: imagePath || null,
      channel: channel as Channel,
      amount,
      currency,
    });

    const savedBiodata = await newBiodata.save();

    const response: BaseResponse<{ id: string }> = {
      status: true,
      data: { id: savedBiodata._id.toString() },
      error: null,
    };
    res.status(201).json(response);
  } catch (error: any) {
    console.error("Error creating biodata:", error);
    const response: BaseResponse<null> = {
      status: false,
      data: null,
      error: {
        message: `Failed to create biodata: ${error.message}`,
        code: 500,
      },
    };
    res.status(500).json(response);
  }
});

// POST /biodata/update-payment - Update payment status and generate PDF
Router.post("/update-payment", authenticateFirebase, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;

    const { id, transactionId, productId } = req.body;

    if (!userId) {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: {
          message: "User ID not found in token",
          code: 400,
        },
      };
      return res.status(400).json(response);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: {
          message: "Invalid id format",
          code: 400,
        },
      };
      return res.status(400).json(response);
    }

    // Validate transaction_id
    if (!transactionId) {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: {
          message: "Transaction ID is required",
          code: 400,
        },
      };
      return res.status(400).json(response);
    }

    // Find the biodata entry that belongs to the user
    const biodata = await UserBioData.findOne({
      _id: id,
      user_id: userId,
    });

    if (!biodata) {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: {
          message: "Biodata not found or you don't have access to it",
          code: 404,
        },
      };
      return res.status(404).json(response);
    }

    // Verify template_id matches product identifier
    if (productId && biodata.template_id !== productId) {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: {
          message: "Product ID does not match the template ID",
          code: 400,
        },
      };
      return res.status(400).json(response);
    }

    // Verify purchase with RevenueCat using transaction_id as store_purchase_identifier
    const verificationResult = await verifyRevenueCatPurchase(transactionId);

    if (!verificationResult.verified) {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: {
          message: verificationResult.error || "Purchase verification failed",
          code: 400,
        },
      };
      return res.status(400).json(response);
    }

    // Update payment status and dump the entire RevenueCat response
    biodata.payment_status = "PAYMENT_SUCCESS";
    biodata.pg_response = { transaction_id: transactionId, revenuecat_response: verificationResult.data };
    biodata.pg_response_credt = new Date();
    biodata.pgType = "REVENUECAT";
    await biodata.save();

    // Generate PDF
    const template = await loadTemplate(biodata.template_id);

    const formdata: ITemplateProps = {
      formData: biodata.form_data as unknown as string,
      isPreview: false,
      imagePath: biodata.image_path,
    };

    const pdfStream = await template(formdata);

    // Setting up the response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=biodata-${id}.pdf`);

    // Stream the PDF back to the user
    pdfStream.pipe(res);
  } catch (error: any) {
    console.error("Error updating payment and generating PDF:", error);

    // Handle invalid template ID errors
    if (error.message && error.message.includes("Invalid template_id")) {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: {
          message: error.message,
          code: 400,
        },
      };
      return res.status(400).json(response);
    }

    const response: BaseResponse<null> = {
      status: false,
      data: null,
      error: {
        message: `Failed to update payment: ${error.message}`,
        code: 500,
      },
    };
    res.status(500).json(response);
  }
});

// GET /biodata - Get all biodata for authenticated user
Router.get("/", authenticateFirebase, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get user ID from Firebase auth token
    const userId = req.user?.uid;

    if (!userId) {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: {
          message: "User ID not found in token",
          code: 400,
        },
      };
      return res.status(400).json(response);
    }

    // Query MongoDB for user's biodata - only select specific fields
    const biodataList = await UserBioData.find({ user_id: userId })
      .select('form_data template_id image_path created_on')
      .sort({ created_on: -1 }) // Sort by newest first
      .lean();

    const response: BaseResponse<typeof biodataList> = {
      status: true,
      data: biodataList,
      error: null,
    };
    res.json(response);
  } catch (error: any) {
    console.error("Error fetching user biodata:", error);
    const response: BaseResponse<null> = {
      status: false,
      data: null,
      error: {
        message: `Failed to fetch biodata: ${error.message}`,
        code: 500,
      },
    };
    res.status(500).json(response);
  }
});

// GET /biodata/:id - Get specific biodata by ID for authenticated user
Router.get("/:id", authenticateFirebase, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const biodataId = req.params.id;

    if (!userId) {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: {
          message: "User ID not found in token",
          code: 400,
        },
      };
      return res.status(400).json(response);
    }

    // Query MongoDB for specific biodata that belongs to the user - only select specific fields
    const biodata = await UserBioData.findOne({ 
      _id: biodataId, 
      user_id: userId 
    })
      .select('form_data template_id image_path created_on')
      .lean();

    if (!biodata) {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: {
          message: "Biodata not found or you don't have access to it",
          code: 404,
        },
      };
      return res.status(404).json(response);
    }

    const response: BaseResponse<typeof biodata> = {
      status: true,
      data: biodata,
      error: null,
    };
    res.json(response);
  } catch (error: any) {
    console.error("Error fetching biodata:", error);
    const response: BaseResponse<null> = {
      status: false,
      data: null,
      error: {
        message: `Failed to fetch biodata: ${error.message}`,
        code: 500,
      },
    };
    res.status(500).json(response);
  }
});

export { Router };

