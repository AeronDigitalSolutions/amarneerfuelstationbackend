import mongoose, { Schema, Document } from "mongoose";

export interface IAttendance extends Document {
  employeeId: mongoose.Types.ObjectId;
  date: string;
  shift: string;
  inTime: string;
  outTime: string;
  status: string;
  overtimeHours: number;
  salaryEarned?: number;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    date: { type: String, required: true },
    shift: { type: String, required: true },
    inTime: { type: String, required: true },
    outTime: { type: String },
    status: { type: String, default: "Present" },
    overtimeHours: { type: Number, default: 0 },
    salaryEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IAttendance>("Attendance", attendanceSchema);
