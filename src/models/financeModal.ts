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
  createdAt?: Date;
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
  },
  { timestamps: true }
);

export default mongoose.model<IFinance>("Finance", financeSchema);
