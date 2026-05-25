import { DataTypes } from "sequelize";
import sequelize from "../config/db";

const Finance: any = sequelize.define(
  "Finance",
  {
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    pumpId: { type: DataTypes.UUID, allowNull: true },
    entryType: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    debit: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    credit: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    amount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    modeOfPayment: { type: DataTypes.STRING, allowNull: true },
    supplierName: { type: DataTypes.STRING, allowNull: true },
    invoiceNo: { type: DataTypes.STRING, allowNull: true },
    autoTimestamp: { type: DataTypes.DATE, allowNull: true },
    userTimestamp: { type: DataTypes.DATE, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: true },
    attendantName: { type: DataTypes.STRING, allowNull: true },
  },
  { tableName: "finance_entries", timestamps: true }
);

export default Finance;
