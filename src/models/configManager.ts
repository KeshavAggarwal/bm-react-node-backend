import mongoose, { Schema, Document } from "mongoose";
import { getISTDate } from "../helpers";

export interface IConfigManager extends Document {
  created_on: Date;
  key: string;
  value: string;
}

const configManagerSchema = new Schema<IConfigManager>({
  created_on: {
    type: Date,
    default: getISTDate,
  },
  key: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: false,
  },
});

export default mongoose.model<IConfigManager>(
  "ConfigManager",
  configManagerSchema
);
