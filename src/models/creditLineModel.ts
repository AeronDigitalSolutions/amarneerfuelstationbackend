import mongoose, { Schema, Document } from "mongoose";

export interface ICreditAccount extends Document {
  accountId: string;
  accountName: string;

  phoneNo: string;
  email: string;
  companyName: string;

  aadhaarNo: string;
  panNo: string;
  document?: string;

  fuelType: "Petrol" | "Diesel";
  vehicles: {
    vehicleNo: string;
    fuelType: "Petrol" | "Diesel";
  }[];

  creditLimit: number;
  contactPerson: string;

  totalSales: number;
  totalPayments: number;
  outstanding: number;

  transactions: {
    date: Date;
    type: "Sale" | "Payment";
    amount: number;
    vehicleNo?: string;
    fuelType?: "Petrol" | "Diesel";
    volume?: number;
    rate?: number;
    paymentMode?: string;
  }[];
}

const creditSchema = new Schema<ICreditAccount>(
  {
    accountId: { type: String, required: true, unique: true },
    accountName: { type: String, required: true },

    phoneNo: { type: String },
    email: { type: String },
    companyName: { type: String },

    aadhaarNo: { type: String },
    panNo: { type: String },
    document: { type: String },

    fuelType: { type: String, enum: ["Petrol", "Diesel"], required: true },

    vehicles: [
      {
        vehicleNo: String,
        fuelType: { type: String, enum: ["Petrol", "Diesel"] },
      },
    ],

    creditLimit: { type: Number, required: true },
    contactPerson: { type: String },

    totalSales: { type: Number, default: 0 },
    totalPayments: { type: Number, default: 0 },
    outstanding: { type: Number, default: 0 },

    transactions: [
      {
        date: { type: Date, default: Date.now },
        type: { type: String, enum: ["Sale", "Payment"], required: true },
        amount: { type: Number, required: true },
        vehicleNo: { type: String },
        fuelType: { type: String },
        volume: { type: Number },
        rate: { type: Number },
        paymentMode: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<ICreditAccount>("CreditAccount", creditSchema);
