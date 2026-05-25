import { DataTypes } from "sequelize";
import sequelize from "../config/db";

const ActionLog: any = sequelize.define(
  "ActionLog",
  {
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, field: "id" },
    user: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false },
    action: { type: DataTypes.TEXT, allowNull: false },
  },
  { tableName: "action_logs", timestamps: true }
);

export default ActionLog;
