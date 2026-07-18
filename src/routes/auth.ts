import express, { Request, Response } from "express";
import axios from "axios";
import rateLimit from "express-rate-limit";
import admin from "../firebaseAdmin";
import { BaseResponse } from "../types/response";
import { apiKeyGuard, logRequestIp } from "../middleware/authMiddleware";

const Router = express.Router();

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY as string;
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID as string;

const ONE_HOUR_MS = 60 * 60 * 1000;

function rateLimitHandler(message: string) {
  return (req: Request, res: Response) => {
    console.log("[RATE LIMIT]", {
      path: req.path,
      ip: req.ip,
      xForwardedFor: req.headers["x-forwarded-for"],
      phone: req.body?.phone,
      message,
    });
    const response: BaseResponse<null> = {
      status: false,
      data: null,
      error: { message, code: 429 },
    };
    res.status(429).json(response);
  };
}

// send-otp: max 10 per IP per hour
const sendOtpIpLimiter = rateLimit({
  windowMs: ONE_HOUR_MS,
  limit: 10,
  keyGenerator: (req) => req.ip ?? "unknown",
  handler: rateLimitHandler("Too many requests from this device."),
  standardHeaders: true,
  legacyHeaders: false,
});

// send-otp: max 10 per phone number per hour
const sendOtpPhoneLimiter = rateLimit({
  windowMs: ONE_HOUR_MS,
  limit: 10,
  keyGenerator: (req) => `phone:${req.body?.phone ?? req.ip}`,
  handler: rateLimitHandler(
    "Too many OTP requests. Please try again after an hour.",
  ),
  standardHeaders: true,
  legacyHeaders: false,
});

// verify-otp: max 10 per IP per hour (only failed attempts count)
const verifyOtpIpLimiter = rateLimit({
  windowMs: ONE_HOUR_MS,
  limit: 10,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => req.ip ?? "unknown",
  handler: rateLimitHandler(
    "Too many verification attempts. Please try again later.",
  ),
  standardHeaders: true,
  legacyHeaders: false,
});

// verify-otp: max 5 per phone number per hour (only failed attempts count)
const verifyOtpPhoneLimiter = rateLimit({
  windowMs: ONE_HOUR_MS,
  limit: 5,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `phone:${req.body?.phone ?? req.ip}`,
  handler: rateLimitHandler("Too many verification attempts for this number."),
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /auth/send-otp
// Accepts { phone: "9876543210" } — 10-digit Indian number, no country code
Router.post(
  "/send-otp",
  logRequestIp,
  apiKeyGuard,
  sendOtpIpLimiter,
  sendOtpPhoneLimiter,
  async (req: Request, res: Response) => {
    try {
      const { phone } = req.body;

      if (!phone || !/^\d{10}$/.test(phone)) {
        const response: BaseResponse<null> = {
          status: false,
          data: null,
          error: {
            message: "A valid 10-digit Indian phone number is required",
            code: 400,
          },
        };
        return res.status(400).json(response);
      }

      const mobile = `91${phone}`;

      await axios.post(
        "https://control.msg91.com/api/v5/otp",
        {},
        {
          params: {
            template_id: MSG91_TEMPLATE_ID,
            mobile,
            authkey: MSG91_AUTH_KEY,
            otp_length: 6,
          },
        },
      );

      const response: BaseResponse<null> = {
        status: true,
        data: null,
        error: null,
      };
      return res.status(200).json(response);
    } catch (error: any) {
      console.error(
        "MSG91 send-otp error:",
        error?.response?.data ?? error.message,
      );
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: {
          message: "Failed to send OTP. Please try again.",
          code: 500,
        },
      };
      return res.status(500).json(response);
    }
  },
);

// POST /auth/verify-otp
// Accepts { phone: "9876543210", otp: "123456" }
Router.post(
  "/verify-otp",
  apiKeyGuard,
  verifyOtpIpLimiter,
  verifyOtpPhoneLimiter,
  async (req: Request, res: Response) => {
    try {
      const { phone, otp } = req.body;

      if (!phone || !/^\d{10}$/.test(phone)) {
        const response: BaseResponse<null> = {
          status: false,
          data: null,
          error: {
            message: "A valid 10-digit Indian phone number is required",
            code: 400,
          },
        };
        return res.status(400).json(response);
      }

      if (!otp || !/^\d{4,8}$/.test(String(otp))) {
        const response: BaseResponse<null> = {
          status: false,
          data: null,
          error: {
            message: "A valid OTP is required",
            code: 400,
          },
        };
        return res.status(400).json(response);
      }

      const mobile = `91${phone}`;

      // Verify OTP with MSG91
      let msg91Response: any;
      try {
        const { data } = await axios.get(
          "https://control.msg91.com/api/v5/otp/verify",
          {
            params: {
              mobile,
              otp: String(otp),
              authkey: MSG91_AUTH_KEY,
            },
          },
        );
        msg91Response = data;
      } catch (verifyError: any) {
        // MSG91 returns non-2xx for invalid OTP in some SDK versions; treat as invalid
        console.error(
          "MSG91 verify-otp error:",
          verifyError?.response?.data ?? verifyError.message,
        );
        const response: BaseResponse<null> = {
          status: false,
          data: null,
          error: {
            message: "Invalid OTP",
            code: 400,
          },
        };
        return res.status(400).json(response);
      }

      // MSG91 returns { type: "error", message: "..." } for wrong OTP
      if (!msg91Response || msg91Response.type === "error") {
        const response: BaseResponse<null> = {
          status: false,
          data: null,
          error: {
            message: "Invalid OTP",
            code: 400,
          },
        };
        return res.status(400).json(response);
      }

      // OTP is valid — resolve or create Firebase user
      const phoneNumber = `+91${phone}`;
      let user: admin.auth.UserRecord;
      let isNewUser = false;

      try {
        user = await admin.auth().getUserByPhoneNumber(phoneNumber);
      } catch (fetchError: any) {
        if (fetchError.code === "auth/user-not-found") {
          user = await admin.auth().createUser({ phoneNumber });
          isNewUser = true;
        } else {
          throw fetchError;
        }
      }

      const customToken = await admin.auth().createCustomToken(user.uid);

      const response: BaseResponse<{
        customToken: string;
        isNewUser: boolean;
      }> = {
        status: true,
        data: { customToken, isNewUser },
        error: null,
      };
      return res.status(200).json(response);
    } catch (error: any) {
      console.error("verify-otp error:", error.message);
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: {
          message: "Failed to verify OTP. Please try again.",
          code: 500,
        },
      };
      return res.status(500).json(response);
    }
  },
);

// google sign-in: max 20 per IP per hour
const googleSignInLimiter = rateLimit({
  windowMs: ONE_HOUR_MS,
  limit: 20,
  keyGenerator: (req) => req.ip ?? "unknown",
  handler: rateLimitHandler(
    "Too many sign-in attempts. Please try again later.",
  ),
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /auth/google
// Accepts { idToken: string } — Firebase ID token obtained after Google Sign-In on the client.
// Verifies the token, detects account collisions, upserts the MongoDB user record, and
// returns { isNewUser: bool }.
Router.post(
  "/google",
  logRequestIp,
  apiKeyGuard,
  googleSignInLimiter,
  async (req: Request, res: Response) => {
    const { idToken } = req.body;

    if (!idToken || typeof idToken !== "string") {
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: { message: "idToken is required", code: 400 },
      };
      return res.status(400).json(response);
    }

    try {
      // Verify the Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { uid, email } = decodedToken;

      // --- Account-collision detection ---
      // Check if any OTHER Firebase user already has this email but authenticated
      // via a different provider (e.g. phone OTP from the India flow).
      if (email) {
        try {
          const result = await admin.auth().getUsers([{ email }]);
          const collision = result.users.find(
            (u) =>
              u.uid !== uid &&
              u.providerData.some((p) => p.providerId === "phone"),
          );
          if (collision) {
            const response: BaseResponse<null> = {
              status: false,
              data: null,
              error: {
                message:
                  "An account with this email is already linked to a phone number. Please sign in with your phone number instead.",
                code: "account_collision" as any,
              },
            };
            return res.status(409).json(response);
          }
        } catch (lookupErr) {
          // Non-fatal: log and continue
          console.warn("[google-auth] email lookup error:", lookupErr);
        }
      }

      // Upsert MongoDB user record (channel = ANDROID for now; extend if iOS is added)
      let isNewUser = false;
      const existing = await User.findOne({ firebase_uid: uid });
      if (!existing) {
        isNewUser = true;
        await User.create({
          firebase_uid: uid,
          phone: null,
          channel: "ANDROID",
          created_on: getISTDate(),
          updated_on: getISTDate(),
        });
      } else {
        await User.updateOne(
          { firebase_uid: uid },
          { $set: { updated_on: getISTDate() } },
        );
      }

      const response: BaseResponse<{ isNewUser: boolean }> = {
        status: true,
        data: { isNewUser },
        error: null,
      };
      return res.status(200).json(response);
    } catch (error: any) {
      // Firebase token verification failures
      if (
        error.code === "auth/id-token-expired" ||
        error.code === "auth/argument-error" ||
        error.code === "auth/id-token-revoked"
      ) {
        const response: BaseResponse<null> = {
          status: false,
          data: null,
          error: {
            message: "Invalid or expired token. Please sign in again.",
            code: 401,
          },
        };
        return res.status(401).json(response);
      }
      console.error("[google-auth] error:", error.message ?? error);
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: {
          message: "Authentication failed. Please try again.",
          code: 500,
        },
      };
      return res.status(500).json(response);
    }
  },
);

export { Router };
