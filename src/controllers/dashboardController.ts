import { Request, Response } from "express";
import Sale from "../models/saleModel";
import Attendance from "../models/attendanceModels";
import Tank from "../models/tankModel";
import CreditAccount from "../models/creditLineModel";
import { getPumpIdOrThrow } from "../middleware/pumpContext";

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(req);
    const sales = (await Sale.findAll({ where: { pumpId } })) as any[];
    const totalSales = sales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
    const totalLitres = sales.reduce((sum, s) => sum + Number(s.totalLitres || 0), 0);

    const cashPayments = sales
      .filter((s) => s.paymentMode === "Cash")
      .reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);

    const bankPayments = sales
      .filter((s) => s.paymentMode === "Bank")
      .reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);

    const tanks = (await Tank.findAll({ where: { pumpId } })) as any[];
    const stockLevels = tanks.map((t) => ({
      fuelType: t.productType,
      currentLevel: Number(t.closingStock || 0),
      capacity: Number(t.capacity || 0),
    }));

    const attendance = (await Attendance.findAll({ where: { pumpId } })) as any[];
    const totalStaff = new Set(attendance.map((a) => a.employeeId)).size;
    const today = new Date().toISOString().split("T")[0];
    const presentToday = attendance.filter((a) => String(a.date || "").split("T")[0] === today).length;

    const creditAccounts = (await CreditAccount.findAll({ where: { pumpId } })) as any[];
    const totalOutstanding = creditAccounts.reduce(
      (sum, acc) => sum + Number(acc.outstanding || 0),
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
