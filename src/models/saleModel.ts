import { DataTypes } from "sequelize";
import sequelize from "../config/db";

const Sale: any = sequelize.define(
  "Sale",
  {
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    pumpId: { type: DataTypes.UUID, allowNull: true },
    saleId: { type: DataTypes.STRING, allowNull: false },
    date: { type: DataTypes.STRING, allowNull: false },
    time: { type: DataTypes.STRING, allowNull: true },
    shift: { type: DataTypes.STRING, allowNull: false },
    machineNo: { type: DataTypes.STRING, allowNull: false },
    entries: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    totalLitres: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    totalAmount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    cashAmount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    upiAmount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    cardAmount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    creditLineAmount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    companyAccountAmount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    totalReceivedAtPump: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    totalPayment: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    paymentMode: { type: DataTypes.STRING, allowNull: false, defaultValue: "Cash" },
    creditParty: { type: DataTypes.STRING, allowNull: true },
    remarks: { type: DataTypes.TEXT, allowNull: true },
    attendant: { type: DataTypes.STRING, allowNull: true },
  },
  { tableName: "sales", timestamps: true }
);

export default Sale;
