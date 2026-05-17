import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import sequelize, { connectDB } from "../config/db";

import User from "../models/userModel";
import ActionLog from "../models/actionLogModel";
import Employee from "../models/employeeModels";
import Attendance from "../models/attendanceModels";
import { Machine } from "../models/Machine";
import FuelTest from "../models/FuelTest";
import Shift from "../models/Shift";
import TankMaster from "../models/addtank";
import Tank from "../models/tankModel";
import Sale from "../models/saleModel";
import Payment from "../models/payment";
import Finance from "../models/financeModal";
import CreditAccount from "../models/creditLineModel";
import { FuelRate } from "../models/FuelRates";

dotenv.config();

const parseBoolean = (value: string | undefined, fallback = false) => {
  if (value == null) return fallback;
  return ["1", "true", "yes", "y", "on"].includes(value.toLowerCase());
};

const asLegacyId = (value: any): string | null => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value.toString && typeof value.toString === "function") return value.toString();
  if (value.$oid) return String(value.$oid);
  return null;
};

const asDate = (value: any): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const setTimestamps = (doc: any, payload: Record<string, any>) => {
  const createdAt = asDate(doc.createdAt);
  const updatedAt = asDate(doc.updatedAt);
  if (createdAt) payload.createdAt = createdAt;
  if (updatedAt) payload.updatedAt = updatedAt;
};

const main = async () => {
  const mongoUri = process.env.MONGO_SOURCE_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_SOURCE_URI (or MONGO_URI) is required for migration");
  }

  const sourceDbName =
    process.env.MONGO_SOURCE_DB ||
    (() => {
      try {
        const path = new URL(mongoUri).pathname.replace(/^\//, "");
        return path.split("?")[0] || "";
      } catch {
        return "";
      }
    })();

  if (!sourceDbName) {
    throw new Error("Could not determine Mongo source DB name. Set MONGO_SOURCE_DB.");
  }

  const truncateTarget = parseBoolean(process.env.MIGRATION_TRUNCATE, true);

  console.log("▶ Connecting PostgreSQL...");
  await connectDB();

  if (truncateTarget) {
    console.log("⚠ Truncating PostgreSQL tables before migration...");
    await sequelize.truncate({ cascade: true, restartIdentity: true });
  }

  console.log("▶ Connecting MongoDB source...");
  const mongoClient = new MongoClient(mongoUri);
  await mongoClient.connect();
  const db = mongoClient.db(sourceDbName);

  const userIdMap = new Map<string, string>();
  const employeeIdMap = new Map<string, string>();
  const machineIdMap = new Map<string, string>();

  const counters: Record<string, number> = {};
  const bump = (key: string) => {
    counters[key] = (counters[key] || 0) + 1;
  };

  const loadCollection = async (...names: string[]) => {
    for (const name of names) {
      const exists = await db.listCollections({ name }).hasNext();
      if (exists) {
        const docs = await db.collection(name).find({}).toArray();
        console.log(`• Loaded ${docs.length} from ${name}`);
        return docs;
      }
    }
    console.log(`• Collection not found: ${names.join(" | ")}`);
    return [] as any[];
  };

  try {
    const users = await loadCollection("users");
    for (const doc of users) {
      if (!doc.email && !doc.username) continue;
      const existing = await User.findOne({
        where: doc.email ? { email: doc.email } : { username: doc.username },
      });

      const payload: any = {
        username: doc.username || doc.email,
        email: doc.email || `${doc.username}@local.invalid`,
        password: doc.password || "",
        role: doc.role || "Attendant",
      };
      setTimestamps(doc, payload);

      let row: any;
      if (existing) {
        await existing.update(payload);
        row = existing;
      } else {
        row = await User.create(payload);
      }

      const oldId = asLegacyId(doc._id);
      if (oldId) userIdMap.set(oldId, row._id);
      bump("users");
    }

    const logs = await loadCollection("actionlogs", "action_logs");
    for (const doc of logs) {
      const payload: any = {
        user: doc.user || "System",
        role: doc.role || "Admin",
        action: doc.action || "",
      };
      setTimestamps(doc, payload);
      await ActionLog.create(payload);
      bump("actionLogs");
    }

    const employees = await loadCollection("employees");
    for (const doc of employees) {
      const payload: any = {
        name: doc.name || "Unnamed",
        role: doc.role || "Staff",
        salaryType: doc.salaryType === "Shift" ? "Daily" : doc.salaryType || "Monthly",
        salaryAmount: Number(doc.salaryAmount || 0),
        phone: doc.phone || null,
      };
      setTimestamps(doc, payload);

      const row = await Employee.create(payload);
      const oldId = asLegacyId(doc._id);
      if (oldId) employeeIdMap.set(oldId, row._id);
      bump("employees");
    }

    const machines = await loadCollection("machines");
    for (const doc of machines) {
      const payload: any = {
        machineNo: doc.machineNo,
        machineName: doc.machineName || doc.machineNo,
        nozzles: Array.isArray(doc.nozzles) ? doc.nozzles : [],
      };
      setTimestamps(doc, payload);

      if (!payload.machineNo) continue;
      const row = await Machine.create(payload);
      const oldId = asLegacyId(doc._id);
      if (oldId) machineIdMap.set(oldId, row._id);
      bump("machines");
    }

    const shifts = await loadCollection("shifts");
    for (const doc of shifts) {
      const payload: any = {
        shiftName: doc.shiftName || doc.name || "Shift",
        startTime: doc.startTime || "00:00",
        endTime: doc.endTime || "00:00",
        notes: doc.notes || null,
      };
      setTimestamps(doc, payload);
      await Shift.create(payload);
      bump("shifts");
    }

    const tankMasterRows = await loadCollection("tankmasters", "tank_master");
    for (const doc of tankMasterRows) {
      const payload: any = {
        name: doc.name || doc.tankName || doc.productType || "Tank",
        productType: doc.productType || null,
        capacity: doc.capacity != null ? Number(doc.capacity) : null,
      };
      setTimestamps(doc, payload);
      await TankMaster.create(payload);
      bump("tankMaster");
    }

    const tanks = await loadCollection("tanks");
    for (const doc of tanks) {
      const payload: any = {
        tankId: doc.tankId || doc._id?.toString?.() || "tank",
        productType: doc.productType || "Diesel",
        capacity: Number(doc.capacity || 0),
        openingStock: Number(doc.openingStock || 0),
        quantityReceived: Number(doc.quantityReceived || 0),
        soldQuantity: Number(doc.soldQuantity || 0),
        lowStockAlertLevel: Number(doc.lowStockAlertLevel || 0),
        ratePerLitre: Number(doc.ratePerLitre || 0),
        closingStock: Number(doc.closingStock || 0),
        totalAmount: Number(doc.totalAmount || 0),
        invoiceDensity: doc.invoiceDensity != null ? Number(doc.invoiceDensity) : null,
        chambers: Array.isArray(doc.chambers) ? doc.chambers : [],
        supplierName: doc.supplierName || null,
        tankerReceiptNo: doc.tankerReceiptNo || null,
        receivedBy: doc.receivedBy || null,
        remarks: doc.remarks || null,
        dateTime: doc.dateTime || null,
      };
      setTimestamps(doc, payload);
      await Tank.create(payload);
      bump("tanks");
    }

    const fuelRates = await loadCollection("fuelrates", "fuel_rates");
    for (const doc of fuelRates) {
      const payload: any = {
        rates: doc.rates && typeof doc.rates === "object" ? doc.rates : {},
      };
      setTimestamps(doc, payload);
      await FuelRate.create(payload);
      bump("fuelRates");
    }

    const sales = await loadCollection("sales");
    for (const doc of sales) {
      const payload: any = {
        saleId: doc.saleId || asLegacyId(doc._id) || "sale",
        date: doc.date || new Date().toISOString().split("T")[0],
        time: doc.time || null,
        shift: doc.shift || "A",
        machineNo: doc.machineNo || "",
        entries: Array.isArray(doc.entries) ? doc.entries : [],
        totalLitres: Number(doc.totalLitres || 0),
        totalAmount: Number(doc.totalAmount || 0),
        cashAmount: Number(doc.cashAmount || 0),
        upiAmount: Number(doc.upiAmount || 0),
        cardAmount: Number(doc.cardAmount || 0),
        totalPayment: Number(doc.totalPayment || 0),
        paymentMode: doc.paymentMode || "Cash",
        creditParty: doc.creditParty || null,
        remarks: doc.remarks || null,
        attendant: doc.attendant || null,
      };
      setTimestamps(doc, payload);
      await Sale.create(payload);
      bump("sales");
    }

    const creditAccounts = await loadCollection("creditaccounts", "credit_accounts");
    for (const doc of creditAccounts) {
      const payload: any = {
        accountId: doc.accountId || asLegacyId(doc._id) || `ACC-${Date.now()}`,
        accountName: doc.accountName || "Unknown",
        phoneNo: doc.phoneNo || null,
        email: doc.email || null,
        companyName: doc.companyName || null,
        aadhaarNo: doc.aadhaarNo || null,
        panNo: doc.panNo || null,
        document: doc.document || null,
        fuelType: doc.fuelType === "Petrol" ? "Petrol" : "Diesel",
        vehicles: Array.isArray(doc.vehicles) ? doc.vehicles : [],
        creditLimit: Number(doc.creditLimit || 0),
        contactPerson: doc.contactPerson || null,
        totalSales: Number(doc.totalSales || 0),
        totalPayments: Number(doc.totalPayments || 0),
        outstanding: Number(doc.outstanding || 0),
        dueDate: asDate(doc.dueDate),
        status: doc.status || "normal",
        lastReminderSent: asDate(doc.lastReminderSent),
        transactions: Array.isArray(doc.transactions) ? doc.transactions : [],
      };
      setTimestamps(doc, payload);
      await CreditAccount.create(payload);
      bump("creditAccounts");
    }

    const attendanceRows = await loadCollection("attendances", "attendance");
    for (const doc of attendanceRows) {
      const oldEmpId = asLegacyId(doc.employeeId);
      const mappedEmpId = oldEmpId ? employeeIdMap.get(oldEmpId) : null;
      if (!mappedEmpId) continue;

      const payload: any = {
        employeeId: mappedEmpId,
        date: doc.date || new Date().toISOString().split("T")[0],
        shift: doc.shift || "A",
        inTime: doc.inTime || null,
        outTime: doc.outTime || null,
        status: doc.status || "Present",
        overtimeHours: Number(doc.overtimeHours || 0),
        salaryEarned: Number(doc.salaryEarned || 0),
      };
      setTimestamps(doc, payload);
      await Attendance.create(payload);
      bump("attendance");
    }

    const fuelTests = await loadCollection("fueltests", "fuel_tests");
    for (const doc of fuelTests) {
      const oldMachineId = asLegacyId(doc.machineId);
      const mappedMachineId = oldMachineId ? machineIdMap.get(oldMachineId) : null;
      if (!mappedMachineId) continue;

      const payload: any = {
        machineId: mappedMachineId,
        machineNo: doc.machineNo || "",
        machineName: doc.machineName || "",
        nozzleNo: Number(doc.nozzleNo || 0),
        fuelType: doc.fuelType || "",
        liters: Number(doc.liters || 0),
        startTime: asDate(doc.startTime) || new Date(),
        stopTime: asDate(doc.stopTime) || new Date(),
        duration: Number(doc.duration || 0),
      };
      setTimestamps(doc, payload);
      await FuelTest.create(payload);
      bump("fuelTests");
    }

    const payments = await loadCollection("payments");
    for (const doc of payments) {
      const payload: any = {
        amount: Number(doc.amount || 0),
        mode: ["UPI", "CARD"].includes(String(doc.mode || "").toUpperCase())
          ? String(doc.mode).toUpperCase()
          : "UPI",
      };
      setTimestamps(doc, payload);
      await Payment.create(payload);
      bump("payments");
    }

    const financeRows = await loadCollection("finances", "finance_entries");
    for (const doc of financeRows) {
      const payload: any = {
        entryType: doc.entryType || "Expense",
        category: doc.category || "General",
        description: doc.description || "",
        debit: Number(doc.debit || 0),
        credit: Number(doc.credit || 0),
        amount: Number(doc.amount || 0),
        modeOfPayment: doc.modeOfPayment || null,
        supplierName: doc.supplierName || null,
        invoiceNo: doc.invoiceNo || null,
        autoTimestamp: asDate(doc.autoTimestamp),
        userTimestamp: asDate(doc.userTimestamp),
        name: doc.name || null,
        attendantName: doc.attendantName || null,
      };
      setTimestamps(doc, payload);
      await Finance.create(payload);
      bump("finance");
    }

    console.log("✅ Migration completed");
    console.table(counters);
  } finally {
    await mongoClient.close();
  }
};

main()
  .then(async () => {
    await sequelize.close();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("❌ Migration failed:", err);
    await sequelize.close();
    process.exit(1);
  });
