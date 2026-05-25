import { DataTypes } from "sequelize";
import sequelize from "../config/db";

const Attendance: any = sequelize.define(
  "Attendance",
  {
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    pumpId: { type: DataTypes.UUID, allowNull: true },
    employeeId: { type: DataTypes.UUID, allowNull: false },
    date: { type: DataTypes.STRING, allowNull: false },
    shiftId: { type: DataTypes.UUID, allowNull: true },
    shift: { type: DataTypes.STRING, allowNull: false },
    shiftStartTime: { type: DataTypes.STRING, allowNull: true },
    shiftEndTime: { type: DataTypes.STRING, allowNull: true },
    inTime: { type: DataTypes.STRING, allowNull: true },
    outTime: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "Present" },
    overtimeHours: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    shiftHours: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    perDaySalary: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    perHourSalary: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    overtimePay: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    salaryEarned: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  },
  { tableName: "attendance", timestamps: true }
);

export default Attendance;
