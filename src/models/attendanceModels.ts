import { DataTypes } from "sequelize";
import sequelize from "../config/db";

const Attendance: any = sequelize.define(
  "Attendance",
  {
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    employeeId: { type: DataTypes.UUID, allowNull: false },
    date: { type: DataTypes.STRING, allowNull: false },
    shift: { type: DataTypes.STRING, allowNull: false },
    inTime: { type: DataTypes.STRING, allowNull: true },
    outTime: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "Present" },
    overtimeHours: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    salaryEarned: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  },
  { tableName: "attendance", timestamps: true }
);

export default Attendance;
