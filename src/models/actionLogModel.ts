import mongoose, { Schema, Document } from "mongoose";

export interface IActionLog extends Document {
  user: string;
  role: string;
  action: string;
  timestamp: Date;
}

const logSchema = new Schema<IActionLog>(
  {
    user: { type: String, required: true },
    role: { type: String, required: true },
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IActionLog>("ActionLog", logSchema);
