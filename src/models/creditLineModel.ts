import { DataTypes } from "sequelize";
import sequelize from "../config/db";

const CreditAccount: any = sequelize.define(
  "CreditAccount",
  {
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    accountId: { type: DataTypes.STRING, allowNull: false, unique: true },
    accountName: { type: DataTypes.STRING, allowNull: false },
    phoneNo: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: true },
    companyName: { type: DataTypes.STRING, allowNull: true },
    aadhaarNo: { type: DataTypes.STRING, allowNull: true },
    panNo: { type: DataTypes.STRING, allowNull: true },
    document: { type: DataTypes.TEXT, allowNull: true },
    fuelType: { type: DataTypes.ENUM("Petrol", "Diesel"), allowNull: false },
    vehicles: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    creditLimit: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    contactPerson: { type: DataTypes.STRING, allowNull: true },
    totalSales: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    totalPayments: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    outstanding: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    dueDate: { type: DataTypes.DATE, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "normal" },
    lastReminderSent: { type: DataTypes.DATE, allowNull: true },
    transactions: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
  },
  { tableName: "credit_accounts", timestamps: true }
);

export default CreditAccount;
