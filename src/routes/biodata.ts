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
const REVENUECAT_BASE_URL = "https://api.revenuecat.com";

// Function to fetch all purchases for a customer with pagination support
async function getAllCustomerPurchases(
  customerId: string, 
  environment: 'sandbox' | 'production' = 'sandbox'
): Promise<{
  success: boolean;
  purchases: any[];
  error: string | null;
}> {
  if (!REVENUECAT_API_KEY || !REVENUECAT_PROJECT_ID) {
    return { success: false, purchases: [], error: "RevenueCat configuration is missing" };
  }

  try {
    const allPurchases: any[] = [];
    let nextPagePath: string | null = `/v2/projects/${REVENUECAT_PROJECT_ID}/customers/${customerId}/purchases?environment=${environment}`;

    // Keep fetching until there's no next_page
    while (nextPagePath) {
      const url: string = `${REVENUECAT_BASE_URL}${nextPagePath}`;
      console.log("Fetching purchases from:", url);

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
        return { 
          success: false, 
          purchases: [], 
          error: `Failed to fetch purchases: ${response.status}` 
        };
      }

      const data: any = await response.json();

      // Add purchases from this page to the list
      if (data.items && Array.isArray(data.items)) {
        allPurchases.push(...data.items);
      }

      // Check if there's a next page
      nextPagePath = data.next_page || null;
    }

    return { success: true, purchases: allPurchases, error: null };
  } catch (error: any) {
    console.error("Error fetching customer purchases:", error);
    return { success: false, purchases: [], error: error.message || "Error fetching purchases" };
  }
}

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
    console.log("transaction id: ", transactionId);
    
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
      return { verified: false, data: null, error: `Payment verification failed. Please try again later.` };
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
    console.error("Error verifying purchase:", error);
    return { verified: false, data: null, error: "Error verifying purchase" };
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

// GET /biodata/:id/payment-status - Check payment status
Router.post("/payment-status", authenticateFirebase, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    
    const { id: biodataId } = req.body;

    if (!userId) {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: {
          message: "User ID not found",
          code: 400,
        },
      };
      return res.status(400).json(response);
    }

    if (!mongoose.Types.ObjectId.isValid(biodataId)) {
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

    const biodata = await UserBioData.findOne({
      _id: biodataId,
      user_id: userId,
    }).select('payment_status');

    if (!biodata) {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: {
          message: "Biodata not found",
          code: 404,
        },
      };
      return res.status(404).json(response);
    }

    const response: BaseResponse<{ payment_status: string }> = {
      status: true,
      data: { payment_status: biodata.payment_status },
      error: null,
    };
    res.json(response);
  } catch (error: any) {
    console.error("Error fetching payment status:", error);
    const response: BaseResponse<null> = {
      status: false,
      data: null,
      error: {
        message: `Failed to fetch payment status: ${error.message}`,
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
    const biodataListRaw = await UserBioData.find({ user_id: userId })
      .select('form_data template_id image_path created_on')
      .sort({ created_on: -1 }) // Sort by newest first
      .lean();

    const biodataList = biodataListRaw.map(item => ({
      id: item._id.toString(),
      form_data: item.form_data,
      template_id: item.template_id,
      image_path: item.image_path,
      created_on: item.created_on,
    }));

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

