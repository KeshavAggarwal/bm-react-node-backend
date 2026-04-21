import express, { Response } from "express";
import { BaseResponse } from "../types/response";
import { authenticateFirebase, AuthenticatedRequest } from "../middleware/authMiddleware";
import UserBioData from "../models/userBioData";
import mongoose from "mongoose";
import {
  mergeBiodataFormData,
  isValidFormDataStructure,
  extractNormalizedName,
  extractName,
} from "../helpers/biodataEditHelper";
import { fixToIST, getISTDate } from "../helpers";
import { StateDataType } from "../types/formTypes";

type BillingStatus = "FREE" | "PAID" | "UNPAID" | "FAILED";

function getBillingStatus(templateId: string, paymentStatus: string): BillingStatus {
  if (templateId === "eg0") return "FREE";
  if (paymentStatus === "PAYMENT_SUCCESS") return "PAID";
  if (paymentStatus === "PAYMENT_ERROR") return "FAILED";
  return "UNPAID";
}

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

    const { tId, fd, imagePath, channel, amount = 0, currency = "INR", utmSource, utmMedium, utmCampaign } = req.body;

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

    const incomingName = extractNormalizedName(fd);

    // Check if user already has a Pending entry with the same normalized name
    // If yes, reuse it to avoid duplicate Pending cards on home screen
    if (incomingName) {
      const pendingEntries = await UserBioData.find({
        user_id: userId,
        payment_status: { $in: ["PAYMENT_INITIATED", "PAYMENT_ERROR"] },
      }).sort({ created_on: -1 });

      const matchedEntry = pendingEntries.find(entry => {
        const existingName = extractNormalizedName(entry.form_data);
        return existingName === incomingName;
      });

      if (matchedEntry) {
        matchedEntry.template_id = tId;
        matchedEntry.form_data = fd;
        matchedEntry.image_path = imagePath || null;
        matchedEntry.payment_attempts.push({
          attempted_at: getISTDate(),
          template_id: tId,
        });

        await matchedEntry.save();

        const response: BaseResponse<{ id: string }> = {
          status: true,
          data: { id: matchedEntry._id.toString() },
          error: null,
        };
        return res.status(200).json(response);
      }
    }

    // No matching Pending entry — create a fresh one
    const newBiodata = new UserBioData({
      user_id: userId,
      template_id: tId,
      form_data: fd,
      image_path: imagePath || null,
      channel: channel as Channel,
      amount,
      currency,
      utmSource,
      utmMedium,
      utmCampaign,
      payment_attempts: [{ attempted_at: getISTDate(), template_id: tId }],
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

// POST /biodata/payment-status - Check payment status
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
    console.log("-----PAYMENT STATUS-----")
    console.log(response);
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
      .select('form_data template_id image_path created_on last_edit_at payment_status')
      .sort({ created_on: -1 }) // Sort by newest first
      .lean();

    const biodataList = biodataListRaw.map(item => {
      const name = extractName(item.form_data) ?? 'Unknown';

      return {
        id: item._id.toString(),
        name: name,
        template_id: item.template_id,
        image_path: item.image_path,
        created_on: fixToIST(item.created_on),
        is_free: item.template_id === "eg0" || item.payment_status !== "PAYMENT_SUCCESS",
        billing_status: getBillingStatus(item.template_id, item.payment_status),
        modified_on: item.last_edit_at ? fixToIST(item.last_edit_at) : null,
      };
    });

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

// PUT /biodata/:id/edit - Edit biodata (only form_data_editable). This api is used to edit the biodata.
Router.post("/:id/edit", authenticateFirebase, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const biodataId = req.params.id;
    const { fd: incomingFormData, imagePath, tId: templateId } = req.body;

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

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(biodataId)) {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: {
          message: "Invalid ID format",
          code: 400,
        },
      };
      return res.status(400).json(response);
    }

    // Allow empty object {} for intentional clear
    if (incomingFormData === undefined || incomingFormData === null) {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: {
          message: "data is required in request body",
          code: 400,
        },
      };
      return res.status(400).json(response);
    }

    // If not empty, validate structure
    if (
      typeof incomingFormData === "object" &&
      Object.keys(incomingFormData).length > 0 &&
      !isValidFormDataStructure(incomingFormData)
    ) {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: {
          message: "Invalid form_data structure",
          code: 400,
        },
      };
      return res.status(400).json(response);
    }

    // Fetch the biodata document
    const biodata = await UserBioData.findOne({
      _id: biodataId,
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

    // Reject template change attempts on paid entries before mutating anything
    if (templateId && biodata.payment_status === "PAYMENT_SUCCESS" && templateId !== biodata.template_id) {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: {
          message: "Template cannot be changed after payment",
          code: 403,
        },
      };
      return res.status(403).json(response);
    }

    // Accept all form data as-is (including restricted fields)
    // Protection happens during merge - restricted fields always use original values
    // Empty {} is valid - it clears all edits
    biodata.form_data_editable = incomingFormData;
    biodata.last_edit_at = getISTDate();
    biodata.edit_version = (biodata.edit_version || 0) + 1;

    // Allow template change only when not yet paid (UNPAID/FAILED)
    // TODO: i guess this will also allow the template edit in FREE case but we are not doing this in app
    if (templateId && biodata.payment_status !== "PAYMENT_SUCCESS") {
      biodata.template_id = templateId;
    }

    // Update image path if provided
    if (imagePath !== undefined) {
      biodata.image_path = imagePath;
    }

    await biodata.save();

    const response: BaseResponse<{
      message: string;
    }> = {
      status: true,
      data: {
        message: "Biodata updated successfully",
      },
      error: null,
    };
    res.json(response);
  } catch (error: any) {
    console.error("Error editing biodata:", error);
    const response: BaseResponse<null> = {
      status: false,
      data: null,
      error: {
        message: `Failed to edit biodata: ${error.message}`,
        code: 500,
      },
    };
    res.status(500).json(response);
  }
});

// GET /biodata/:id - Get specific biodata by ID for authenticated user, this api is called when user clicks the edit button in the biodata list.
// This api is used to get the biodata for editing.
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

    if (!mongoose.Types.ObjectId.isValid(biodataId)) {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: {
          message: "Invalid ID format",
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
      .select('form_data form_data_editable template_id image_path created_on payment_status')
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

    // Merge form_data with form_data_editable for the final biodata
    const finalFormData = mergeBiodataFormData(
      biodata.form_data as StateDataType,
      biodata.form_data_editable as StateDataType
    );

    const mappedBiodata = {
      id: biodata._id.toString(),
      template_id: biodata.template_id,
      image_path: biodata.image_path,
      created_on: fixToIST(biodata.created_on),
      billing_status: getBillingStatus(biodata.template_id, biodata.payment_status),
      form_data: finalFormData,
    };

    const response: BaseResponse<typeof mappedBiodata> = {
      status: true,
      data: mappedBiodata,
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

