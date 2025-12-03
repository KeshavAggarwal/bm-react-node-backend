import express, { Response }  from "express";
import { loadTemplate } from "../utils";
import { ITemplateProps } from "../types/templateTypes";
import { authenticateFirebase, AuthenticatedRequest } from "../middleware/authMiddleware";
import { BaseResponse } from "../types/response";

const Router = express.Router();

Router.post("/", authenticateFirebase, async (req: AuthenticatedRequest, res: Response) => {
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
    res.setHeader("Content-Disposition", `attachment; filename=export.pdf`);

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

export { Router };
