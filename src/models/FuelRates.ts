import mongoose, { Document, Schema } from "mongoose";

export interface IFuelRate extends Document {
  rates: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

const fuelRateSchema = new Schema<IFuelRate>(
  {
    rates: {
      type: Map,
      of: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const FuelRate = mongoose.model<IFuelRate>("FuelRate", fuelRateSchema);
