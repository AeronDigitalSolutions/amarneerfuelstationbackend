import mongoose, { Schema, Document } from "mongoose";

export interface ISale extends Document {
  date: Date;
  fuelType: "Petrol" | "Diesel";
  litres: number;
  amount: number;
  paymentMode: string;
}

const saleSchema = new Schema<ISale>(
  {
    date: { type: Date, default: Date.now },
    fuelType: { type: String, enum: ["Petrol", "Diesel"], required: true },
    litres: { type: Number, required: true },
    amount: { type: Number, required: true },
    paymentMode: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ISale>("Sale", saleSchema);
