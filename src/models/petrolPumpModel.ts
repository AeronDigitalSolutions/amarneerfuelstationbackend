import { DataTypes } from "sequelize";
import sequelize from "../config/db";

const PetrolPump: any = sequelize.define(
  "PetrolPump",
  {
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, field: "id" },
    ownerUserId: { type: DataTypes.UUID, allowNull: false },
    primarySuperAdminUserId: { type: DataTypes.UUID, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: false },
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    location: { type: DataTypes.STRING, allowNull: true },
    dataIsolationKey: { type: DataTypes.STRING, allowNull: false, unique: true },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { tableName: "petrol_pumps", timestamps: true }
);

export default PetrolPump;
