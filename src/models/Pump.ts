import mongoose, { Schema, Document } from "mongoose";

export interface IFuelType {
  type: string; // e.g. "Petrol", "Diesel", "Premium Petrol"
}

export interface IPump extends Document {
  pumpNo: string;
  pumpName: string;
  fuels: IFuelType[];
  createdAt: Date;
  updatedAt: Date;
}

const pumpSchema = new Schema<IPump>(
  {
    pumpNo: { type: String, required: true, unique: true },
    pumpName: { type: String, required: true },
    fuels: [
      {
        type: {
          type: String,
          enum: ["Petrol", "Diesel", "Premium Petrol"],
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export const Pump = mongoose.model<IPump>("Pump", pumpSchema);
