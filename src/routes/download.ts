import express, { Response }  from "express";
import { loadTemplate } from "../utils";
import { ITemplateProps } from "../types/templateTypes";
import { authenticateFirebase, AuthenticatedRequest } from "../middleware/authMiddleware";
import { BaseResponse } from "../types/response";
import UserBioData from "../models/userBioData";
import mongoose from "mongoose";

const Router = express.Router();

Router.post("/preview", authenticateFirebase, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log(req.body);
    const { tId, fd, imagePath, isPreview = true } = req.body;

    // Validate required fields
    if (!tId || !fd) {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: {
          message: "Missing required fields",
          code: 400,
        },
      };
      return res.status(400).json(response);
    }

    // Load template dynamically with validation
    const template = await loadTemplate(tId);

    const aa = JSON.stringify(fd);
    console.log(aa);
    const formdata: ITemplateProps = {
      formData: aa,
      isPreview: isPreview,
      imagePath,
    };
    const result = await template(formdata);
    // Setting up the response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=biodata-preview-bm.pdf`);

    // Streaming our resulting pdf back to the user
    result.pipe(res);
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

    // Handle other errors
    const response: BaseResponse<null> = {
      status: false,
      data: null,
      error: {
        message: "Failed to generate PDF",
        code: 500,
      },
    };
    res.status(500).json(response);
  }
});

Router.post("/final", authenticateFirebase, async (req: AuthenticatedRequest, res: Response) => {
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
    });

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

    if (biodata.payment_status !== "PAYMENT_SUCCESS") {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: {
          message: "Payment not completed",
          code: 403,
        },
      };
      return res.status(403).json(response);
    }

    const template = await loadTemplate(biodata.template_id);

    const formdata: ITemplateProps = {
      formData: JSON.stringify(biodata.form_data),
      isPreview: false,
      imagePath: biodata.image_path,
    };

    const pdfStream = await template(formdata);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=biodata-${biodataId}.pdf`);

    pdfStream.pipe(res);
  } catch (error: any) {
    console.error("Error downloading PDF:", error);

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
        message: "Failed to generate PDF",
        code: 500,
      },
    };
    res.status(500).json(response);
  }
});

export { Router };
