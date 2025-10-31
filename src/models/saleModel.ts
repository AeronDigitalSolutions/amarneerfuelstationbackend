import mongoose, { Schema, Document } from "mongoose";

export interface ISale extends Document {
  saleId: string;
  date: string;
  shift: string;
  pumpNumber: number;
  productType: string;
  openingMeter: number;
  closingMeter: number;
  litresSold: number;
  ratePerLitre: number;
  totalAmount: number;
  paymentMode: string;
  creditParty?: string;
  remarks?: string;
  attendant?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SaleSchema = new Schema<ISale>(
  {
    saleId: { type: String, required: true },
    date: { type: String, required: true },
    shift: { type: String, required: true },
    pumpNumber: { type: Number, required: true },
    productType: { type: String, required: true },
    openingMeter: { type: Number, required: true },
    closingMeter: { type: Number, required: true },
    litresSold: { type: Number, required: true },
    ratePerLitre: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paymentMode: { type: String, required: true },
    creditParty: { type: String },
    remarks: { type: String },
    attendant: { type: String },
  },
  {
    timestamps: true, // ✅ adds createdAt and updatedAt automatically
  }
);

export default mongoose.model<ISale>("Sale", SaleSchema);
