import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "Admin" | "Manager" | "Cashier" | "Accountant" | "Attendant";
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["Admin", "Manager", "Cashier", "Accountant", "Attendant"],
      default: "Attendant",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
