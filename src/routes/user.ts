import express, { Response } from "express";
import { BaseResponse } from "../types/response";
import {
  authenticateFirebase,
  AuthenticatedRequest,
} from "../middleware/authMiddleware";
import User from "../models/user";
import { getISTDate } from "../helpers";

const Router = express.Router();

// PATCH /user/fcm-token
// Updates (or creates) the FCM token for the authenticated user.
// Body: { fcm_token: string, channel: "ANDROID" | "IOS" }
//
// Uses upsert so Google-login users (who have no prior User doc) are handled
// automatically — no separate "create user" step needed after Google sign-in.
//
// Stores tokens per-platform so the same user logged into both iOS and Android
// receives notifications on both devices simultaneously.
Router.patch(
  "/fcm-token",
  authenticateFirebase,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const firebaseUid = req.user?.uid;
      // Firebase ID token carries email for Google users
      const email = (req.user as any)?.email ?? null;

      if (!firebaseUid) {
        const response: BaseResponse<null> = {
          status: false,
          data: null,
          error: { message: "User ID not found in token", code: 400 },
        };
        return res.status(400).json(response);
      }

      const { fcm_token, channel } = req.body;

      if (!fcm_token || typeof fcm_token !== "string") {
        const response: BaseResponse<null> = {
          status: false,
          data: null,
          error: { message: "Invalid request", code: 400 },
        };
        return res.status(400).json(response);
      }

      const VALID_CHANNELS = ["ANDROID", "IOS"] as const;
      if (!channel || !VALID_CHANNELS.includes(channel)) {
        const response: BaseResponse<null> = {
          status: false,
          data: null,
          error: { message: "Invalid request", code: 400 },
        };
        return res.status(400).json(response);
      }

      const nowIST = getISTDate();

      // Map channel → the correct per-platform field
      const tokenField =
        channel === "ANDROID" ? "fcm_token_android" : "fcm_token_ios";

      await User.findOneAndUpdate(
        { firebase_uid: firebaseUid },
        {
          $set: {
            [tokenField]: fcm_token,
            fcm_token_updated_on: nowIST,
            updated_on: nowIST,
            // Persist email for Google users (safe no-op for phone users)
            ...(email ? { email } : {}),
          },
          // $setOnInsert only runs when creating a NEW doc via upsert.
          // This handles Google-login users who never went through verify-otp.
          $setOnInsert: {
            firebase_uid: firebaseUid,
            phone: null,
            created_on: nowIST,
          },
        },
        { upsert: true, new: true },
      );

      const response: BaseResponse<null> = {
        status: true,
        data: null,
        error: null,
      };
      return res.status(200).json(response);
    } catch (error: any) {
      console.error("PATCH /user/fcm-token error:", error.message);
      const response: BaseResponse<null> = {
        status: false,
        data: null,
        error: { message: "Failed to update FCM token", code: 500 },
      };
      return res.status(500).json(response);
    }
  },
);

export { Router };
