import express, { Response } from "express";
import { BaseResponse } from "../types/response";
import { authenticateFirebase, AuthenticatedRequest } from "../middleware/authMiddleware";
import UserBioData from "../models/userBioData";
import { loadTemplate } from "../utils";
import { ITemplateProps } from "../types/templateTypes";
import mongoose from "mongoose";

const Router = express.Router();

// Valid channels
const VALID_CHANNELS = ["ANDROID", "IOS", "WEB"] as const;
type Channel = typeof VALID_CHANNELS[number];

/**
 * POST /biodata/create
 * 
 * Create a new biodata entry (before payment)
 * 
 * Flow:
 * 1. User fills form on Android
 * 2. Call this API to save form data
 * 3. Receive biodata ID
 * 4. Pass "userId_biodataId" as app_user_id to RevenueCat
 * 5. RevenueCat webhook will update payment status
 * 6. Poll /biodata/:id/status until payment_status === "PAYMENT_SUCCESS"
 * 7. Download PDF via /biodata/:id/download
 */
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

    // Stringify fd
    const stringifiedFormData = JSON.stringify(fd);

    console.log(`📝 Creating biodata for user: ${userId}`);

    // Create new biodata entry
    const newBiodata = new UserBioData({
      user_id: userId,
      template_id: tId,
      form_data: stringifiedFormData,
      image_path: imagePath || null,
      channel: channel as Channel,
      amount,
      currency,
    });

    const savedBiodata = await newBiodata.save();
    const biodataId = savedBiodata._id.toString();

    console.log(`✅ Biodata created: ${biodataId}`);

    // Return biodata ID and app_user_id for RevenueCat
    // Android should pass this as app_user_id when initiating purchase
    const appUserId = `${userId}_${biodataId}`;

    const response: BaseResponse<{ 
      id: string;
      app_user_id: string;
    }> = {
      status: true,
      data: { 
        id: biodataId,
        app_user_id: appUserId, // Use this for RevenueCat purchase
      },
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

/**
 * GET /biodata/:id/status
 * 
 * Poll payment status for a biodata entry
 * Used by Android app to check if payment webhook has been received
 * 
 * Returns:
 * - payment_status: Current payment status
 * - pdf_ready: Boolean indicating if PDF can be downloaded
 */
Router.get("/:id/status", authenticateFirebase, async (req: AuthenticatedRequest, res: Response) => {
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

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(biodataId)) {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: {
          message: "Invalid biodata ID format",
          code: 400,
        },
      };
      return res.status(400).json(response);
    }

    // Find biodata and verify ownership
    const biodata = await UserBioData.findOne({
      _id: biodataId,
      user_id: userId,
    }).select("payment_status pdf_generated created_on revenuecat_transaction_id");

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

    // Return status information
    const response: BaseResponse<{
      payment_status: string;
      pdf_ready: boolean;
      transaction_id: string | null;
    }> = {
      status: true,
      data: {
        payment_status: biodata.payment_status,
        pdf_ready: biodata.payment_status === "PAYMENT_SUCCESS",
        transaction_id: biodata.revenuecat_transaction_id,
      },
      error: null,
    };

    res.json(response);
  } catch (error: any) {
    console.error("Error checking payment status:", error);
    const response: BaseResponse<null> = {
      status: false,
      data: null,
      error: {
        message: `Failed to check status: ${error.message}`,
        code: 500,
      },
    };
    res.status(500).json(response);
  }
});

/**
 * GET /biodata/:id/download
 * 
 * Download PDF for a paid biodata entry
 * Only works if payment_status is PAYMENT_SUCCESS
 * 
 * Security checks:
 * - User must be authenticated
 * - Biodata must belong to authenticated user
 * - Payment must be completed
 */
Router.get("/:id/download", authenticateFirebase, async (req: AuthenticatedRequest, res: Response) => {
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

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(biodataId)) {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: {
          message: "Invalid biodata ID format",
          code: 400,
        },
      };
      return res.status(400).json(response);
    }

    // Find biodata and verify ownership
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

    // CRITICAL: Check if payment is successful
    if (biodata.payment_status !== "PAYMENT_SUCCESS") {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: {
          message: "Payment not completed. Cannot download PDF.",
          code: 403,
        },
      };
      return res.status(403).json(response);
    }

    console.log(`🎯 Generating PDF for biodata: ${biodataId}`);

    // Generate PDF
    const template = await loadTemplate(biodata.template_id);

    const formdata: ITemplateProps = {
      formData: biodata.form_data as unknown as string,
      isPreview: false,
      imagePath: biodata.image_path,
    };

    const pdfStream = await template(formdata);

    // Mark PDF as generated (for analytics)
    if (!biodata.pdf_generated) {
      biodata.pdf_generated = true;
      biodata.pdf_generated_at = new Date();
      await biodata.save();
    }

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=biodata-${biodataId}.pdf`);

    // Stream the PDF back to the client
    pdfStream.pipe(res);

    console.log(`✅ PDF generated successfully for biodata: ${biodataId}`);

  } catch (error: any) {
    console.error("Error generating PDF:", error);

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
        message: `Failed to generate PDF: ${error.message}`,
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

