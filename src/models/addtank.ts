import { DataTypes } from "sequelize";
import sequelize from "../config/db";

const TankMaster: any = sequelize.define(
  "TankMaster",
  {
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    pumpId: { type: DataTypes.UUID, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: false },
    productType: { type: DataTypes.STRING, allowNull: true },
    capacity: { type: DataTypes.FLOAT, allowNull: true },
  },
  { tableName: "tank_master", timestamps: true }
);

export default TankMaster;
