import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

const fallbackDb = process.env.PGDATABASE || "petrol_pump_mgmt";
const databaseUrl = process.env.DATABASE_URL || `postgresql:///${fallbackDb}`;

const sequelize = new Sequelize(databaseUrl, {
  dialect: "postgres",
  logging: false,
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected");
    await sequelize.sync();
    console.log("✅ PostgreSQL models synchronized");
  } catch (err) {
    console.error("❌ PostgreSQL connection error:", err);
    process.exit(1);
  }
};

export default sequelize;
