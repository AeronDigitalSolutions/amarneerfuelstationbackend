import { Request, Response } from "express";
import CreditAccount from "../models/creditLineModel";
import { getPumpIdOrThrow } from "../middleware/pumpContext";

export const getAllCreditTransactions = async (req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(req);
    const accounts = await CreditAccount.findAll({ where: { pumpId } });

    const all: any[] = [];

    accounts.forEach((account: any) => {
      const tx = Array.isArray(account.transactions) ? account.transactions : [];

      tx.forEach((t: any) => {
        all.push({
          accountId: account.accountId,
          accountName: account.accountName,
          phoneNo: account.phoneNo,
          companyName: account.companyName,
          creditLimit: account.creditLimit,
          outstanding: account.outstanding,
          type: t.type ?? "N/A",
          amount: Number(t.amount ?? 0),
          rate: t.rate ?? "-",
          volume: t.volume ?? "-",
          fuelType: t.fuelType ?? "-",
          vehicleNo: t.vehicleNo ?? "-",
          machineNo: t.machineNo ?? "",
          shift: t.shift ?? "",
          saleDate: t.saleDate ?? "",
          settlementMode: t.settlementMode ?? "CreditLine",
          date: t.date ? new Date(t.date) : new Date(account.createdAt),
        });
      });
    });

    all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return res.status(200).json(all);
  } catch (error) {
    console.error("❌ CREDIT TRANSACTION ERROR:", error);
    return res.status(500).json({
      message: "Error fetching transactions",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const getCreditTransactionSummary = async (req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(req);
    const date = typeof req.query.date === "string" ? req.query.date.trim() : "";
    const shift = typeof req.query.shift === "string" ? req.query.shift.trim() : "";
    const machineNo = typeof req.query.machineNo === "string" ? req.query.machineNo.trim() : "";

    if (!date || !shift) {
      return res.status(400).json({ message: "date and shift are required" });
    }

    const accounts = await CreditAccount.findAll({ where: { pumpId } });
    let creditLineAmount = 0;
    let companyAccountAmount = 0;
    const matchedTransactions: any[] = [];
    const vehicleSummaryMap = new Map<
      string,
      {
        accountId: string;
        accountName: string;
        vehicleNo: string;
        fuelType: string;
        settlementMode: string;
        totalAmount: number;
        transactionCount: number;
        machineNos: Set<string>;
      }
    >();

    accounts.forEach((account: any) => {
      const tx = Array.isArray(account.transactions) ? account.transactions : [];
      tx.forEach((t: any) => {
        const type = String(t.type || "").trim().toLowerCase();
        if (type !== "sale") return;
        if (String(t.saleDate || "").trim() !== date) return;
        if (String(t.shift || "").trim() !== shift) return;
        if (machineNo && String(t.machineNo || "").trim() !== machineNo) return;

        const amount = Number(t.amount || 0);
        const settlementMode = String(t.settlementMode || "CreditLine").trim();
        if (settlementMode === "CompanyAccount") companyAccountAmount += amount;
        else creditLineAmount += amount;

        const vehicleNo = String(t.vehicleNo || "N/A").trim();
        const fuelType = String(t.fuelType || "").trim();
        const machine = String(t.machineNo || "").trim();
        const key = [
          account.accountId,
          vehicleNo,
          fuelType,
          settlementMode,
          machine || "N/A",
        ].join("|");

        const existing = vehicleSummaryMap.get(key);
        if (existing) {
          existing.totalAmount += amount;
          existing.transactionCount += 1;
          if (machine) existing.machineNos.add(machine);
        } else {
          vehicleSummaryMap.set(key, {
            accountId: account.accountId,
            accountName: account.accountName,
            vehicleNo,
            fuelType,
            settlementMode,
            totalAmount: amount,
            transactionCount: 1,
            machineNos: new Set(machine ? [machine] : []),
          });
        }

        matchedTransactions.push({
          accountId: account.accountId,
          accountName: account.accountName,
          amount,
          vehicleNo,
          fuelType,
          machineNo: machine,
          shift: t.shift || "",
          saleDate: t.saleDate || "",
          settlementMode,
          date: t.date || null,
        });
      });
    });

    const vehicleBreakdown = Array.from(vehicleSummaryMap.values())
      .map((v) => ({
        accountId: v.accountId,
        accountName: v.accountName,
        vehicleNo: v.vehicleNo,
        fuelType: v.fuelType,
        settlementMode: v.settlementMode,
        totalAmount: Number(v.totalAmount.toFixed(2)),
        transactionCount: v.transactionCount,
        machineNos: Array.from(v.machineNos),
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    return res.status(200).json({
      date,
      shift,
      machineNo,
      creditLineAmount: Number(creditLineAmount.toFixed(2)),
      companyAccountAmount: Number(companyAccountAmount.toFixed(2)),
      totalNonCashSettlements: Number((creditLineAmount + companyAccountAmount).toFixed(2)),
      matchedCount: matchedTransactions.length,
      matchedVehicleCount: vehicleBreakdown.length,
      vehicleBreakdown,
      matchedTransactions,
    });
  } catch (error) {
    console.error("❌ CREDIT SUMMARY ERROR:", error);
    return res.status(500).json({
      message: "Error fetching credit summary",
      error: error instanceof Error ? error.message : error,
    });
  }
};
