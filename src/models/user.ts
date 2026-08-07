import mongoose, { Schema, Document } from "mongoose";
import { getISTDate } from "../helpers";

export interface IUser extends Document {
  firebase_uid: string;
  phone: string | null;
  fcm_token: string | null;
  fcm_token_updated_on: Date | null;
  channel: "ANDROID" | "IOS";
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
    fcm_token: {
      type: String,
      default: null,
    },
    fcm_token_updated_on: {
      type: Date,
      default: null,
    },
    channel: {
      type: String,
      enum: ["ANDROID", "IOS"],
      default: "ANDROID",
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

export default mongoose.model<IUser>("User", userSchema);
