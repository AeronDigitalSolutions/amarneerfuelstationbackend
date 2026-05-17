import { DataTypes } from "sequelize";
import sequelize from "../config/db";

const Employee: any = sequelize.define(
  "Employee",
  {
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false },
    salaryType: { type: DataTypes.ENUM("Monthly", "Daily"), allowNull: false },
    salaryAmount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    phone: { type: DataTypes.STRING, allowNull: true },
  },
  { tableName: "employees", timestamps: true }
);

export default Employee;
