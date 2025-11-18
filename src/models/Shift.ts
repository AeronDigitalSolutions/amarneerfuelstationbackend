import mongoose, { Schema, Document } from "mongoose";

export interface IShift extends Document {
  shiftName: string;
  startTime: string;
  endTime: string;
}

const shiftSchema: Schema = new Schema(
  {
    shiftName: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IShift>("Shift", shiftSchema);
