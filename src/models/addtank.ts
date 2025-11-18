import mongoose, { Schema, Document } from "mongoose";

export interface ITankMaster extends Document {
  tankId: string;
  fuelType: string;
  capacity: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const tankSchema = new Schema<ITankMaster>(
  {
    tankId: { type: String, required: true, unique: true },
    fuelType: {
      type: String,
      required: true,
      enum: ["Petrol", "Diesel", "Premium Petrol", "CNG"],
    },
    capacity: { type: Number, required: true },
  },
  { timestamps: true }
);

const TankMaster = mongoose.model<ITankMaster>("TankMaster", tankSchema);

export default TankMaster;
