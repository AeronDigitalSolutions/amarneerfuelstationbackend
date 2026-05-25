import { DataTypes } from "sequelize";
import sequelize from "../config/db";

export const FuelRate: any = sequelize.define(
  "FuelRate",
  {
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, field: "id" },
    pumpId: { type: DataTypes.UUID, allowNull: true },
    rates: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  },
  { tableName: "fuel_rates", timestamps: true }
);

export default FuelRate;
