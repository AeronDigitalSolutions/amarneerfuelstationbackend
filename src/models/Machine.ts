import { DataTypes } from "sequelize";
import sequelize from "../config/db";

export const Machine: any = sequelize.define(
  "Machine",
  {
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    pumpId: { type: DataTypes.UUID, allowNull: true },
    machineNo: { type: DataTypes.STRING, allowNull: false },
    machineName: { type: DataTypes.STRING, allowNull: false },
    nozzles: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
  },
  { tableName: "machines", timestamps: true }
);

export default Machine;
