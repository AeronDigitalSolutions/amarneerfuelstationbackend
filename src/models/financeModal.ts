import mongoose, { Schema, Document } from "mongoose";

export interface IFinance extends Document {
  entryType: string;
  category: string;
  description: string;
  debit: number;
  credit: number;
  amount: number;
  modeOfPayment?: string;
  supplierName?: string;
  invoiceNo?: string;
  // New fields for daily expense
  autoTimestamp?: Date;   // server filled if not provided
  userTimestamp?: Date;   // optional user-provided date/time
  name?: string;
  attendantName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const financeSchema = new Schema<IFinance>(
  {
    entryType: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    modeOfPayment: { type: String },
    supplierName: { type: String },
    invoiceNo: { type: String },

    // new fields
    autoTimestamp: { type: Date }, // server generated if missing
    userTimestamp: { type: Date },
    name: { type: String },
    attendantName: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IFinance>("Finance", financeSchema);
