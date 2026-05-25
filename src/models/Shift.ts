import { DataTypes } from "sequelize";
import sequelize from "../config/db";

const Shift: any = sequelize.define(
  "Shift",
  {
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, field: "id" },
    pumpId: { type: DataTypes.UUID, allowNull: true },
    shiftName: { type: DataTypes.STRING, allowNull: false },
    startTime: { type: DataTypes.STRING, allowNull: false },
    endTime: { type: DataTypes.STRING, allowNull: false },
    notes: { type: DataTypes.TEXT, allowNull: true },
  },
  { tableName: "shifts", timestamps: true }
);

export default Shift;
