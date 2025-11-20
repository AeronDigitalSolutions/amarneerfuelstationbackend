import { Schema, model, Document } from "mongoose";

export interface IPayment extends Document {
  amount: number;
  mode: "UPI" | "CARD";
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    amount: { type: Number, required: true },
    mode: { type: String, enum: ["UPI", "CARD"], required: true },
  },
  { timestamps: true }
);

export default model<IPayment>("Payment", paymentSchema);
