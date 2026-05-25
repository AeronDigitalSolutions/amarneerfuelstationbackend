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
    await sequelize.query(`ALTER TABLE IF EXISTS fuel_tests ADD COLUMN IF NOT EXISTS density DOUBLE PRECISION`);
    await sequelize.query(`ALTER TABLE IF EXISTS sales ADD COLUMN IF NOT EXISTS credit_line_amount DOUBLE PRECISION DEFAULT 0`);
    await sequelize.query(`ALTER TABLE IF EXISTS sales ADD COLUMN IF NOT EXISTS company_account_amount DOUBLE PRECISION DEFAULT 0`);
    await sequelize.query(`ALTER TABLE IF EXISTS sales ADD COLUMN IF NOT EXISTS total_received_at_pump DOUBLE PRECISION DEFAULT 0`);
    await sequelize.query(`ALTER TABLE IF EXISTS tanks ADD COLUMN IF NOT EXISTS "dipVolume" DOUBLE PRECISION DEFAULT 0`);
    await sequelize.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_employees_employmenttype') THEN
        CREATE TYPE "enum_employees_employmenttype" AS ENUM ('Full-time', 'Part-time');
      END IF;
    END $$;`);
    await sequelize.query(`ALTER TABLE IF EXISTS employees ADD COLUMN IF NOT EXISTS "employmentType" "enum_employees_employmenttype" DEFAULT 'Full-time'`);
    await sequelize.query(`ALTER TABLE IF EXISTS employees ADD COLUMN IF NOT EXISTS "grantedHolidays" INTEGER DEFAULT 0`);
    await sequelize.query(`ALTER TABLE IF EXISTS attendance ADD COLUMN IF NOT EXISTS "shiftHours" DOUBLE PRECISION DEFAULT 0`);
    await sequelize.query(`ALTER TABLE IF EXISTS attendance ADD COLUMN IF NOT EXISTS "perDaySalary" DOUBLE PRECISION DEFAULT 0`);
    await sequelize.query(`ALTER TABLE IF EXISTS attendance ADD COLUMN IF NOT EXISTS "perHourSalary" DOUBLE PRECISION DEFAULT 0`);
    await sequelize.query(`ALTER TABLE IF EXISTS attendance ADD COLUMN IF NOT EXISTS "overtimePay" DOUBLE PRECISION DEFAULT 0`);
    console.log("✅ PostgreSQL models synchronized");
  } catch (err) {
    console.error("❌ PostgreSQL connection error:", err);
    process.exit(1);
  }
};

export default sequelize;
