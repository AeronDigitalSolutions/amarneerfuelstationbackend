import { DataTypes } from "sequelize";
import sequelize from "../config/db";

const FuelTest: any = sequelize.define(
  "FuelTest",
  {
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, field: "id" },
    pumpId: { type: DataTypes.UUID, allowNull: true },
    machineId: { type: DataTypes.UUID, allowNull: false },
    machineNo: { type: DataTypes.STRING, allowNull: false },
    machineName: { type: DataTypes.STRING, allowNull: false },
    nozzleNo: { type: DataTypes.INTEGER, allowNull: false },
    fuelType: { type: DataTypes.STRING, allowNull: false },
    liters: { type: DataTypes.FLOAT, allowNull: false },
    density: { type: DataTypes.FLOAT, allowNull: true },
    startTime: { type: DataTypes.DATE, allowNull: false },
    stopTime: { type: DataTypes.DATE, allowNull: false },
    duration: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  },
  { tableName: "fuel_tests", timestamps: true }
);

export default FuelTest;
