import { DataTypes } from "sequelize";
import sequelize from "../config/db";

const Employee: any = sequelize.define(
  "Employee",
  {
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, field: "id" },
    pumpId: { type: DataTypes.UUID, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false, defaultValue: "Full-time" },
    employmentType: { type: DataTypes.ENUM("Full-time", "Part-time"), allowNull: false, defaultValue: "Full-time" },
    salaryType: { type: DataTypes.ENUM("Monthly", "Daily"), allowNull: false },
    salaryAmount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    grantedHolidays: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    phone: { type: DataTypes.STRING, allowNull: true },
  },
  { tableName: "employees", timestamps: true }
);

export default Employee;
