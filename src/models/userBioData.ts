import mongoose, { Schema, Document } from "mongoose";
import { getISTDate } from "../helpers";
import { pgTypeEnum } from "../constants";

export interface IUserBioData extends Document {
  created_on: Date;
  template_id: string;
  form_data: Record<string, any>;
  pg_response: Record<string, any>;
  payment_status: "PAYMENT_SUCCESS" | "PAYMENT_INITIATED" | "PAYMENT_ERROR";
  amount: number;
  device: "m" | "dt" | "t"; // mobile, desktop, tablet respectively
  pg_response_credt: Date;
  image_path: string | null;
  user_agent: string | null;
  rating: number | null;
  review: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  pgType: pgTypeEnum | null;
  rz_pg_webhook_body: Record<string, any>;
  rz_pg_order_id: string | null;
  currency: "INR" | "USD";
  ip_address: string;
  country: string | null;
  fbp: string | null; // Facebook browser ID
  fbc: string | null; // Facebook click ID
  status_api_source:
    | "transactionDetails"
    | "rzpaywebhook"
    | "verifyRzpOrder"
    | "pgCallback"
    | null;
  discount_eligible: "ELIGIBLE" | "NOT_ELIGIBLE" | "APPLIED";
  discount_expiry: Date | null;
  discount_applied: boolean;
  parent_transaction_id: string | null;
  user_id: string; // Firebase UID
  channel: "ANDROID" | "IOS" | "WEB";
  revenuecat_transaction_id: string | null;
  revenuecat_app_user_id: string | null;
  revenuecat_product_id: string | null;
  revenuecat_webhook_received_at: Date | null;
  revenuecat_webhook_event_type: string | null;
  revenuecat_webhook_payload: Record<string, any> | null;
  pdf_generated: boolean;
  pdf_generated_at: Date | null;
}

const userBioDataSchema = new Schema<IUserBioData>({
  created_on: {
    type: Date,
    default: getISTDate,
  },
  template_id: {
    type: String,
    required: true,
  },
  form_data: {
    type: Object,
  },
  payment_status: {
    type: String,
    required: false,
    default: "PAYMENT_INITIATED",
  },
  amount: {
    type: Number,
    required: true,
  },
  pg_response: { type: Object },
  device: {
    type: String,
    required: false,
  },
  pg_response_credt: {
    type: Date,
  },
  image_path: {
    type: String,
    required: false,
    default: null,
  },
  user_agent: {
    type: String,
    required: false,
    default: null,
  },
  rating: {
    type: Number,
    required: false,
    default: 0,
  },
  review: {
    type: String,
    required: false,
    default: null,
  },
  utmSource: {
    type: String,
    required: false,
    default: null,
  },
  utmMedium: {
    type: String,
    required: false,
    default: null,
  },
  utmCampaign: {
    type: String,
    required: false,
    default: null,
  },
  utmTerm: {
    type: String,
    required: false,
    default: null,
  },
  currency: {
    type: String,
    required: true,
    default: "INR",
  },
  pgType: {
    type: String,
    required: false,
    default: null,
  },
  rz_pg_webhook_body: { type: Object, required: false, default: null },
  rz_pg_order_id: {
    type: String,
    required: false,
    default: null,
  },
  ip_address: {
    type: String,
    required: false,
    default: null,
  },
  country: {
    type: String,
    required: false,
    default: null,
  },
  status_api_source: {
    type: String,
    required: false,
    default: null,
  },
  discount_eligible: {
    type: String,
    enum: ["ELIGIBLE", "NOT_ELIGIBLE", "APPLIED"],
    default: "NOT_ELIGIBLE",
  },
  discount_expiry: {
    type: Date,
    default: null,
  },
  discount_applied: {
    type: Boolean,
    default: false,
  },
  parent_transaction_id: {
    type: String,
    default: null,
  },
  fbp: {
    type: String,
    required: false,
  },
  fbc: {
    type: String,
    required: false,
  },
  user_id: {
    type: String,
    required: false, // Optional for backward compatibility with existing records
    index: true, // Add index for faster queries
  },
  channel: {
    type: String,
    required: false,
    default: "WEB",
  },
  revenuecat_transaction_id: {
    type: String,
    required: false,
    default: null,
    index: true, // For quick lookup by transaction ID
  },
  revenuecat_app_user_id: {
    type: String,
    required: false,
    default: null,
  },
  revenuecat_product_id: {
    type: String,
    required: false,
    default: null,
  },
  revenuecat_webhook_received_at: {
    type: Date,
    required: false,
    default: null,
  },
  revenuecat_webhook_event_type: {
    type: String,
    required: false,
    default: null,
  },
  revenuecat_webhook_payload: {
    type: Object,
    required: false,
    default: null,
  },
  pdf_generated: {
    type: Boolean,
    required: false,
    default: false,
  },
  pdf_generated_at: {
    type: Date,
    required: false,
    default: null,
  },
});

export default mongoose.model<IUserBioData>("UserBioData", userBioDataSchema);
