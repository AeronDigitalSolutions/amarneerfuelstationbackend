import mongoose, { Schema, Document } from "mongoose";

export interface IEmployee extends Document {
  name: string;
  role: string;
  salaryType: "Monthly" | "Shift";
  salaryAmount: number;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
}

const employeeSchema = new Schema<IEmployee>(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    salaryType: { type: String, enum: ["Monthly", "Shift"], required: true },
    salaryAmount: { type: Number, required: true },
    bankName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IEmployee>("Employee", employeeSchema);
