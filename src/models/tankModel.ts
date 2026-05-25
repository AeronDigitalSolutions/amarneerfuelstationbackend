import { DataTypes } from "sequelize";
import sequelize from "../config/db";

const Tank: any = sequelize.define(
  "Tank",
  {
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    pumpId: { type: DataTypes.UUID, allowNull: true },
    tankId: { type: DataTypes.STRING, allowNull: false },
    productType: { type: DataTypes.STRING, allowNull: false },
    capacity: { type: DataTypes.FLOAT, allowNull: false },
    openingStock: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    dipVolume: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    quantityReceived: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    soldQuantity: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    lowStockAlertLevel: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    ratePerLitre: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    closingStock: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    totalAmount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    invoiceDensity: { type: DataTypes.FLOAT, allowNull: true },
    chambers: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    supplierName: { type: DataTypes.STRING, allowNull: true },
    tankerReceiptNo: { type: DataTypes.STRING, allowNull: true },
    receivedBy: { type: DataTypes.STRING, allowNull: true },
    remarks: { type: DataTypes.TEXT, allowNull: true },
    dateTime: { type: DataTypes.STRING, allowNull: true },
  },
  { tableName: "tanks", timestamps: true }
);

export default Tank;
