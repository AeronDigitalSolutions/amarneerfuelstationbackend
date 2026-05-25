import { DataTypes } from "sequelize";
import sequelize from "../config/db";

const User: any = sequelize.define(
  "User",
  {
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, field: "id" },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM("Owner", "SuperAdmin", "Admin"),
      allowNull: false,
      defaultValue: "Admin",
    },
    customRoleName: { type: DataTypes.STRING, allowNull: true },
    modulePermissions: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
  },
  { tableName: "users", timestamps: true }
);

export default User;
