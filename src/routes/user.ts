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
// Updates fcm_token and channel for the authenticated user.
// Body: { fcm_token: string, channel: "ANDROID" | "IOS" }
Router.patch(
  "/fcm-token",
  authenticateFirebase,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const firebaseUid = req.user?.uid;

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

      const updated = await User.findOneAndUpdate(
        { firebase_uid: firebaseUid },
        {
          $set: {
            fcm_token,
            channel,
            fcm_token_updated_on: nowIST,
            updated_on: nowIST,
          },
        },
        { new: true },
      );

      if (!updated) {
        const response: BaseResponse<null> = {
          status: false,
          data: null,
          error: { message: "User not found", code: 404 },
        };
        return res.status(404).json(response);
      }

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
