// models/tankModel.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IChamber {
  chamberName: string;
  fuelDensity: number;
}

export interface ITank extends Document {
  tankId: string;
  productType: string;
  capacity: number;
  openingStock: number;
  quantityReceived: number;
  soldQuantity: number;
  lowStockAlertLevel: number;
  ratePerLitre: number;
  supplierName?: string;
  tankerReceiptNo?: string;
  receivedBy?: string;
  remarks?: string;
  closingStock: number;
  totalAmount: number;
  invoiceDensity?: number;            // NEW
  chambers?: IChamber[];              // NEW
  createdAt?: Date;
  updatedAt?: Date;
}

const chamberSchema = new Schema<IChamber>(
  {
    chamberName: { type: String, required: true },
    fuelDensity: { type: Number, required: true },
  },
  { _id: false }
);

const TankSchema = new Schema<ITank>(
  {
    tankId: { type: String, required: true },
    productType: { type: String, required: true },
    capacity: { type: Number, required: true },
    openingStock: { type: Number, required: true },
    quantityReceived: { type: Number, required: true },
    soldQuantity: { type: Number, required: true },
    lowStockAlertLevel: { type: Number, required: true },
    ratePerLitre: { type: Number, required: true },
    supplierName: String,
    tankerReceiptNo: String,
    receivedBy: String,
    remarks: String,
    closingStock: { type: Number, required: true },
    totalAmount: { type: Number, required: true },

    // NEW FIELDS
    invoiceDensity: { type: Number },        // optional
    chambers: { type: [chamberSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<ITank>("Tank", TankSchema);
