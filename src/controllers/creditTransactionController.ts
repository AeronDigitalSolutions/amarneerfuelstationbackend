import { Request, Response } from "express";
import CreditAccount from "../models/creditLineModel";

export const getAllCreditTransactions = async (_req: Request, res: Response) => {
  try {
    const accounts = await CreditAccount.findAll();

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
