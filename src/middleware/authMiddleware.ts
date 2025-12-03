import { Request, Response, NextFunction } from "express";
import admin from "../firebaseAdmin";
import { BaseResponse } from "../types/response";

export interface AuthenticatedRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

export const authenticateFirebase = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: {
          message: `No token provided`,
          code: 401,
        },
      };
      return res.status(401).json(response);
    }

    const idToken = authHeader.split(" ")[1];

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;

    return next();
  } catch (error) {
    console.error("Auth error:", error);
    const response: BaseResponse<null> = {
      status: false,
      data: null,
      error: {
        message: `Unauthorized`,
        code: 401,
      },
    };
    return res.status(401).json(response);
  }
};
