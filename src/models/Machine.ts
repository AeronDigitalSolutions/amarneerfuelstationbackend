// models/Machine.ts
import mongoose, { Schema, Document } from "mongoose";

export interface INozzle {
  nozzleNo: number;
  fuelType: string;
  name?: string; // optional descriptive name
}

export interface IMachine extends Document {
  machineNo: string;
  machineName: string;
  nozzles: INozzle[];
  createdAt: Date;
  updatedAt: Date;
}

const nozzleSchema = new Schema<INozzle>({
  nozzleNo: { type: Number, required: true },
  fuelType: { type: String, required: true }, // dynamic fuel type, no enum
  name: { type: String },
});


const machineSchema = new Schema<IMachine>(
  {
    machineNo: { type: String, required: true, unique: true },
    machineName: { type: String, required: true },
    nozzles: [nozzleSchema],
  },
  { timestamps: true }
);

export const Machine = mongoose.model<IMachine>("Machine", machineSchema);
export default Machine;
