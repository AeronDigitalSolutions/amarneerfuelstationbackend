import mongoose, { Schema, Document } from "mongoose";

export interface IFuelTest extends Document {
  pumpId: mongoose.Types.ObjectId;
  pumpNo: string;
  pumpName: string;
  fuelType: string;
  liters: number;
  startTime: Date;
  stopTime: Date;
  duration: number;
  createdAt: Date;
}

const fuelTestSchema = new Schema<IFuelTest>(
  {
    pumpId: { type: Schema.Types.ObjectId, ref: "Pump", required: true },
    pumpNo: { type: String, required: true },
    pumpName: { type: String, required: true },

    fuelType: { type: String, required: true },
    liters: { type: Number, required: true },

    startTime: { type: Date, required: true },
    stopTime: { type: Date, required: true },
    duration: { type: Number, required: true }, // seconds
  },
  { timestamps: true }
);

export default mongoose.model<IFuelTest>("FuelTest", fuelTestSchema);
