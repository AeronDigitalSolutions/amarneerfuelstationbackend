import { Request, Response } from "express";
import CreditAccount from "../models/creditLineModel";

/* ------------------------------------------------------
   ⭐ GET ALL CREDIT TRANSACTIONS (Flattened & Clean)
------------------------------------------------------- */
export const getAllCreditTransactions = async (req: Request, res: Response) => {
  try {
    const accounts = await CreditAccount.find();

    let all: any[] = [];

    accounts.forEach((acc: any) => {
      const tx = Array.isArray(acc.transactions) ? acc.transactions : [];

      tx.forEach((t: any) => {
        all.push({
          accountId: acc.accountId,
          accountName: acc.accountName,
          phoneNo: acc.phoneNo,
          companyName: acc.companyName,
          creditLimit: acc.creditLimit,
          outstanding: acc.outstanding,

          // ⭐ Transaction Details
          type: t.type ?? "N/A",
          amount: Number(t.amount ?? 0),
          rate: t.rate ?? "-",
          volume: t.volume ?? "-",
          fuelType: t.fuelType ?? "-",
          vehicleNo: t.vehicleNo ?? "-",

          // ⭐ Always guaranteed date
          date: t.date ? new Date(t.date) : new Date(acc.createdAt),
        });
      });
    });

    // ⭐ Safe sorting
    all.sort((a, b) => {
      const A = new Date(a.date).getTime();
      const B = new Date(b.date).getTime();
      return B - A;
    });

    return res.status(200).json(all);

  } catch (error) {
    console.error("❌ CREDIT TRANSACTION ERROR:", error);
    return res.status(500).json({
      message: "Error fetching transactions",
      error: error instanceof Error ? error.message : error,
    });
  }
};
