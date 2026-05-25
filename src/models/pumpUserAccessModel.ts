import { DataTypes } from "sequelize";
import sequelize from "../config/db";

const PumpUserAccess: any = sequelize.define(
  "PumpUserAccess",
  {
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, field: "id" },
    pumpId: { type: DataTypes.UUID, allowNull: false },
    userId: { type: DataTypes.UUID, allowNull: false },
    grantedByUserId: { type: DataTypes.UUID, allowNull: true },
  },
  {
    tableName: "pump_user_access",
    timestamps: true,
    indexes: [{ unique: true, fields: ["pumpId", "userId"] }],
  }
);

export default PumpUserAccess;
