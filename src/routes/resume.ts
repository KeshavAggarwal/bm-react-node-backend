import express, { Response } from "express";
import {
  authenticateFirebase,
  AuthenticatedRequest,
} from "../middleware/authMiddleware";
import { BaseResponse } from "../types/response";
import { IResumeTemplateProps } from "../types/resumeTypes";

const Router = express.Router();

const VALID_RESUME_TEMPLATE_IDS = new Set(["rv1", "rv2", "rv3", "rv4", "rv5", "rv6", "rv7", "rv8"]);

async function loadResumeTemplate(templateId: string) {
  if (!VALID_RESUME_TEMPLATE_IDS.has(templateId)) {
    throw new Error(`Invalid resume template_id: ${templateId}`);
  }
  const num = templateId.replace("rv", "");
  const mod = await import(`../resumeTemplates/ResumeTemplate${num}`);
  return mod.default;
}

// POST /resume/download
// Body: { tId: "rv1", rd: { header: {...}, sections: [...] } }
// Returns: PDF stream
Router.post("/download", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { tId, rd } = req.body;

    if (!tId) {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: { message: "Template ID (tId) is required", code: 400 },
      };
      return res.status(400).json(response);
    }

    if (!rd || typeof rd !== "object") {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: { message: "Resume data (rd) is required", code: 400 },
      };
      return res.status(400).json(response);
    }

    if (!rd.header || !Array.isArray(rd.sections)) {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: {
          message: "Resume data must have header and sections",
          code: 400,
        },
      };
      return res.status(400).json(response);
    }

    const template = await loadResumeTemplate(tId);

    const templateProps: IResumeTemplateProps = {
      resumeData: JSON.stringify(rd),
    };

    const pdfStream = await template(templateProps);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=resume-${tId}.pdf`,
    );
    pdfStream.pipe(res);
  } catch (error: any) {
    console.error("Error generating resume PDF:", error);

    if (error.message?.includes("Invalid resume template_id")) {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: { message: error.message, code: 400 },
      };
      return res.status(400).json(response);
    }

    const response: BaseResponse<null> = {
      status: false,
      data: null,
      error: { message: "Failed to generate resume PDF", code: 500 },
    };
    res.status(500).json(response);
  }
});

export { Router };
