import { Request, Response } from "express";
import Sale from "../models/saleModel";
import Attendance from "../models/attendanceModels";
import Tank from "../models/tankModel";
import CreditAccount from "../models/creditLineModel";

export const getDashboardData = async (_req: Request, res: Response) => {
  try {
    // 1️⃣ Total Sales
    const sales = await Sale.find();
    const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalLitres = sales.reduce((sum, s) => sum + s.litresSold, 0);

    // 2️⃣ Cash Flow (Payments vs Credit)
    const cashPayments = sales
      .filter(s => s.paymentMode === "Cash")
      .reduce((sum, s) => sum + s.totalAmount, 0);

    const bankPayments = sales
      .filter(s => s.paymentMode === "Bank")
      .reduce((sum, s) => sum + s.totalAmount, 0);

    // 3️⃣ Fuel Stock Levels
    const tanks = await Tank.find();
    const stockLevels = tanks.map((t: any) => ({
      fuelType: t.productType,
      currentLevel: t.closingStock,
      capacity: t.capacity,
    }));

    // 4️⃣ Attendance Summary
    const attendance = await Attendance.find();
    const totalStaff = new Set(attendance.map(a => a.employeeId)).size;
    const presentToday = attendance.filter(
      a => a.date.split("T")[0] === new Date().toISOString().split("T")[0]
    ).length;

    // 5️⃣ Credit Accounts Summary
    const creditAccounts = await CreditAccount.find();
    const totalOutstanding = creditAccounts.reduce(
      (sum, acc) => sum + (acc.outstanding || 0),
      0
    );

    res.status(200).json({
      totalSales,
      totalLitres,
      cashPayments,
      bankPayments,
      stockLevels,
      totalStaff,
      presentToday,
      totalOutstanding,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Error fetching dashboard data", error });
  }
};
