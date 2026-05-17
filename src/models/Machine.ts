import { DataTypes } from "sequelize";
import sequelize from "../config/db";

export const Machine: any = sequelize.define(
  "Machine",
  {
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    machineNo: { type: DataTypes.STRING, allowNull: false, unique: true },
    machineName: { type: DataTypes.STRING, allowNull: false },
    nozzles: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
  },
  { tableName: "machines", timestamps: true }
);

export default Machine;
