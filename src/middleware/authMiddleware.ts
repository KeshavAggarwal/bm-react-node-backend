import { Request, Response, NextFunction } from "express";
import admin from "../firebaseAdmin";
import { BaseResponse } from "../types/response";

export const apiKeyGuard = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const key = process.env.APP_API_KEY;
  if (!key || req.headers["x-api-key"] !== key) {
    const response: BaseResponse<null> = {
      status: false,
      data: null,
      error: { message: "Unauthorized", code: 401 },
    };
    return res.status(401).json(response);
  }
  return next();
};

export const logRequestIp = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  console.log("[REQUEST DEBUG]", {
    path: req.path,
    ip: req.ip,
    xForwardedFor: req.headers["x-forwarded-for"],
    remoteAddress: req.socket.remoteAddress,
  });

  next();
};

export interface AuthenticatedRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

export const authenticateFirebase = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
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
