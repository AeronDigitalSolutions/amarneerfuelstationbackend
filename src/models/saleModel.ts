// models/Sale.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ISaleEntry {
  nozzleNo: number;
  nozzleName?: string;
  fuelType: string;
  openingMeter: number;
  closingMeter: number;
  testFuel: number;
  litres: number;
  ratePerLitre: number;
  amount: number;
  attendant?: string;
}

export interface ISale extends Document {
  saleId: string;
  date: string;
  time?: string;
  shift: string;
  machineNo: string;
  entries: ISaleEntry[]; // array of nozzle entries
  totalLitres: number;
  totalAmount: number;
  cashAmount?: number;
  upiAmount?: number;
  cardAmount?: number;
  totalPayment?: number;
  paymentMode?: string;
  creditParty?: string;
  remarks?: string;
  attendant?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const saleEntrySchema = new Schema<ISaleEntry>({
  nozzleNo: { type: Number, required: true },
  nozzleName: { type: String },
  fuelType: { type: String, required: true },
  openingMeter: { type: Number, required: true },
  closingMeter: { type: Number, required: true },
  testFuel: { type: Number, default: 0 },
  litres: { type: Number, required: true },
  ratePerLitre: { type: Number, required: true },
  amount: { type: Number, required: true },
  attendant: { type: String },
});

const saleSchema = new Schema<ISale>(
  {
    saleId: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String },
    shift: { type: String, required: true },
    machineNo: { type: String, required: true },
    entries: { type: [saleEntrySchema], default: [] },
    totalLitres: { type: Number, required: true, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },

    cashAmount: { type: Number, default: 0 },
    upiAmount: { type: Number, default: 0 },
    cardAmount: { type: Number, default: 0 },
    totalPayment: { type: Number, default: 0 },

    paymentMode: { type: String, default: "Cash" },
    creditParty: { type: String },
    remarks: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ISale>("Sale", saleSchema);
