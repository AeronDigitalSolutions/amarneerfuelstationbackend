import mongoose, { Schema, Document } from "mongoose";

export interface ICreditAccount extends Document {
  accountId: string;
  accountName: string;
  name: string;
  email: string;
  creditLimit: number;
  contactPerson: string;
  fuelType: "Petrol" | "Diesel";
  vehicles: string[]; // can hold one or many vehicle numbers
  totalSales: number;
  totalPayments: number;
  outstanding: number;
  transactions: {
    date: Date;
    type: "Sale" | "Payment";
    amount: number;
    paymentMode?: string;
  }[];
}

const creditSchema = new Schema<ICreditAccount>(
  {
    accountId: { type: String, required: true, unique: true },
    accountName: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String },
    creditLimit: { type: Number, required: true },
    contactPerson: { type: String },
    fuelType: { type: String, enum: ["Petrol", "Diesel"], required: true },
    vehicles: [{ type: String }],
    totalSales: { type: Number, default: 0 },
    totalPayments: { type: Number, default: 0 },
    outstanding: { type: Number, default: 0 },
    transactions: [
      {
        date: { type: Date, default: Date.now },
        type: { type: String, enum: ["Sale", "Payment"], required: true },
        amount: { type: Number, required: true },
        paymentMode: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<ICreditAccount>("CreditAccount", creditSchema);
