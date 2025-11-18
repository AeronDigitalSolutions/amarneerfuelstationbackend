import mongoose, { Document, Schema } from "mongoose";

export interface IFuelRate extends Document {
  petrol: number;
  diesel: number;
  premiumPetrol: number;
  cng: number;
  createdAt: Date;
  updatedAt: Date;
}

const fuelRateSchema = new Schema<IFuelRate>(
  {
    petrol: { type: Number, required: true },
    diesel: { type: Number, required: true },
    premiumPetrol: { type: Number, required: true },
    cng: { type: Number, required: true },
  },
  { timestamps: true }
);

export const FuelRate = mongoose.model<IFuelRate>("FuelRate", fuelRateSchema);
