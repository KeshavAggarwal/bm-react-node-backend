import mongoose, { Schema, Document } from "mongoose";

export interface INotificationLog extends Document {
  firebase_uid: string;
  trigger_id: string;
  biodata_id: mongoose.Types.ObjectId | null; // null for NO_BIODATA_* triggers
  status: "SENT" | "FAILED";
  sent_at: Date;
}

const notificationLogSchema = new Schema<INotificationLog>(
  {
    firebase_uid: {
      type: String,
      required: true,
    },
    trigger_id: {
      type: String,
      required: true,
    },
    biodata_id: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    status: {
      type: String,
      enum: ["SENT", "FAILED"],
      required: true,
    },
    sent_at: {
      type: Date,
      required: true,
    },
  },
  { versionKey: false },
);

// Unique index — prevents double-sending the same trigger to the same user/biodata.
// If the insert races (two cron pods), the second insert throws E11000 and is skipped.
// biodata_id = null for NO_BIODATA_* triggers; MongoDB includes null in unique checks.
notificationLogSchema.index(
  { firebase_uid: 1, trigger_id: 1, biodata_id: 1 },
  { unique: true },
);

// Supporting index for the "last 4 hours" cooldown query
notificationLogSchema.index({ firebase_uid: 1, status: 1, sent_at: -1 });

export default mongoose.model<INotificationLog>(
  "NotificationLog",
  notificationLogSchema,
);
