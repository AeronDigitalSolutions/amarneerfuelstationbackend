import mongoose, { Schema, Document } from "mongoose";

export interface ISale extends Document {
  saleId: string;
  date: string;
  time: string;
  shift: string;
  pumpNumber: string;
  productType: string;
  openingMeter: number;
  closingMeter: number;
  testFuel: number;         // ✅ NEW
  litresSold: number;
  ratePerLitre: number;
  totalAmount: number;
  cashAmount?: number;
  upiAmount?: number;
  cardAmount?: number;
  totalPayment?: number;
  paymentMode: string;
  creditParty?: string;
  remarks?: string;
  attendant?: string;
}

const saleSchema = new Schema<ISale>(
  {
    saleId: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String },
    shift: { type: String, required: true },
    pumpNumber: { type: String, required: true },
    productType: { type: String, required: true },
    openingMeter: { type: Number },
    closingMeter: { type: Number },
    testFuel: { type: Number, default: 0 },   // ✅ NEW FIELD
    litresSold: { type: Number, required: true },
    ratePerLitre: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    cashAmount: { type: Number, default: 0 },
    upiAmount: { type: Number, default: 0 },
    cardAmount: { type: Number, default: 0 },
    totalPayment: { type: Number, default: 0 },
    paymentMode: { type: String, required: true },
    creditParty: { type: String },
    remarks: { type: String },
    attendant: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ISale>("Sale", saleSchema);
