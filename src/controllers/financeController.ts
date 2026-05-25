import { Request, Response } from "express";
import Finance from "../models/financeModal";
import { getPumpIdOrThrow } from "../middleware/pumpContext";

export const addFinance = async (req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(req);
    const body: any = { ...req.body };

    if (!body.autoTimestamp) body.autoTimestamp = new Date();
    if (body.userTimestamp) body.userTimestamp = new Date(body.userTimestamp);

    const entry = await Finance.create({ ...body, pumpId });
    res.status(201).json(entry);
  } catch (error) {
    console.error("Error adding finance entry:", error);
    res.status(500).json({ message: "Error adding finance entry", error });
  }
};

export const getAllFinance = async (_req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(_req);
    const entries = await Finance.findAll({ where: { pumpId }, order: [["createdAt", "DESC"]] });
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching finance entries", error });
  }
};

export const getSummary = async (_req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(_req);
    const all = (await Finance.findAll({ where: { pumpId } })) as any[];

    const totalSales = all
      .filter((f) => f.entryType === "Journal" && Number(f.credit || 0) > 0)
      .reduce((sum, f) => sum + Number(f.credit || 0), 0);

    const totalPurchase = all
      .filter((f) => String(f.category || "").toLowerCase().includes("purchase"))
      .reduce((sum, f) => sum + Number(f.debit || 0), 0);

    const totalExpense = all
      .filter((f) => f.entryType === "Expense")
      .reduce((sum, f) => sum + Number(f.amount || 0), 0);

    const profit = totalSales - (totalPurchase + totalExpense);

    const opening = 0;
    const receipts = totalSales;
    const payments = totalPurchase + totalExpense;
    const cashbookBalance = opening + receipts - payments;

    res.status(200).json({ totalSales, totalPurchase, totalExpense, profit, cashbookBalance });
  } catch (error) {
    res.status(500).json({ message: "Error calculating summary", error });
  }
};

export const updateFinance = async (req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(req);
    const { id } = req.params;
    const body: any = { ...req.body };

    if (body.userTimestamp) body.userTimestamp = new Date(body.userTimestamp);

    const entry = await Finance.findOne({ where: { _id: id, pumpId } });
    if (!entry) return res.status(404).json({ message: "Finance entry not found" });

    await entry.update(body);
    res.status(200).json(entry);
  } catch (error) {
    console.error("Error updating finance entry:", error);
    res.status(500).json({ message: "Error updating finance entry", error });
  }
};

export const deleteFinance = async (req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(req);
    const { id } = req.params;
    const entry = await Finance.findOne({ where: { _id: id, pumpId } });

    if (!entry) return res.status(404).json({ message: "Finance entry not found" });

    await entry.destroy();
    res.status(200).json({ message: "Finance entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting finance entry:", error);
    res.status(500).json({ message: "Error deleting finance entry", error });
  }
};
