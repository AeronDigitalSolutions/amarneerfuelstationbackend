import mongoose, { Schema, Document } from "mongoose";

export interface IFuelTest extends Document {
  machineId: mongoose.Types.ObjectId;
  machineNo: string;
  machineName: string;
  nozzleNo: number;
  fuelType: string;
  liters: number;
  startTime: Date;
  stopTime: Date;
  duration: number;
  createdAt: Date;
}

const fuelTestSchema = new Schema<IFuelTest>(
  {
    machineId: { type: Schema.Types.ObjectId, ref: "Machine", required: true },
    machineNo: { type: String, required: true },
    machineName: { type: String, required: true },

    nozzleNo: { type: Number, required: true },
    fuelType: { type: String, required: true },

    liters: { type: Number, required: true },

    startTime: { type: Date, required: true },
    stopTime: { type: Date, required: true },

    duration: { type: Number, required: true }, // seconds
  },
  { timestamps: true }
);

export default mongoose.model<IFuelTest>("FuelTest", fuelTestSchema);
