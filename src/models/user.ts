import mongoose, { Schema, Document } from "mongoose";
import { getISTDate } from "../helpers";

export interface IUser extends Document {
  firebase_uid: string;
  phone: string | null;
  email: string | null;
  fcm_token_android: string | null;
  fcm_token_ios: string | null;
  fcm_token_updated_on: Date | null;
  created_on: Date;
  updated_on: Date;
}

const userSchema = new Schema<IUser>(
  {
    firebase_uid: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      default: null,
    },
    // Email is populated for Google-login users (Firebase ID token carries it)
    email: {
      type: String,
      default: null,
    },
    // Per-platform FCM tokens — allows the same user to receive notifications
    // on both Android and iOS simultaneously (e.g. same Google account on both)
    fcm_token_android: {
      type: String,
      default: null,
    },
    fcm_token_ios: {
      type: String,
      default: null,
    },
    fcm_token_updated_on: {
      type: Date,
      default: null,
    },
    created_on: {
      type: Date,
      default: getISTDate,
    },
    updated_on: {
      type: Date,
      default: getISTDate,
    },
  },
  { versionKey: false },
);

// Unique index on firebase_uid (also declared via `unique: true` above; explicit index for clarity)
userSchema.index({ firebase_uid: 1 }, { unique: true });

// Index for notification cron: NO_BIODATA_NUDGE / NO_BIODATA_REMINDER created_on window queries
userSchema.index({ created_on: 1 });

export default mongoose.model<IUser>("User", userSchema);
