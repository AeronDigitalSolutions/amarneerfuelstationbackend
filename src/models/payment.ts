import { DataTypes } from "sequelize";
import sequelize from "../config/db";

const Payment: any = sequelize.define(
  "Payment",
  {
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    pumpId: { type: DataTypes.UUID, allowNull: true },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    mode: { type: DataTypes.ENUM("UPI", "CARD"), allowNull: false },
  },
  { tableName: "payments", timestamps: true }
);

export default Payment;
