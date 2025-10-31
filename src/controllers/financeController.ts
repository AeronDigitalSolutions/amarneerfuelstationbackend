import { Request, Response } from "express";
import Finance from "../models/financeModal";

// ➕ Create finance entry
export const addFinance = async (req: Request, res: Response) => {
  try {
    const entry = await Finance.create(req.body);
    res.status(201).json(entry);
  } catch (error) {
    console.error("Error adding finance entry:", error);
    res.status(500).json({ message: "Error adding finance entry", error });
  }
};

// 📋 Get all finance entries
export const getAllFinance = async (req: Request, res: Response) => {
  try {
    const entries = await Finance.find().sort({ createdAt: -1 });
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching finance entries", error });
  }
};

// 📈 Profit & Loss Summary
export const getSummary = async (req: Request, res: Response) => {
  try {
    const all = await Finance.find();

    const totalSales = all
      .filter(f => f.entryType === "Journal" && f.credit > 0)
      .reduce((sum, f) => sum + f.credit, 0);

    const totalPurchase = all
      .filter(f => f.category?.toLowerCase().includes("purchase"))
      .reduce((sum, f) => sum + f.debit, 0);

    const totalExpense = all
      .filter(f => f.entryType === "Expense")
      .reduce((sum, f) => sum + f.amount, 0);

    const profit = totalSales - (totalPurchase + totalExpense);

    const opening = 0; // static for now, can be configurable
    const receipts = totalSales;
    const payments = totalPurchase + totalExpense;
    const cashbookBalance = opening + receipts - payments;

    res.status(200).json({ totalSales, totalPurchase, totalExpense, profit, cashbookBalance });
  } catch (error) {
    res.status(500).json({ message: "Error calculating summary", error });
  }
};

// ✏️ Update existing finance entry
export const updateFinance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedEntry = await Finance.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedEntry) {
      return res.status(404).json({ message: "Finance entry not found" });
    }

    res.status(200).json(updatedEntry);
  } catch (error) {
    console.error("Error updating finance entry:", error);
    res.status(500).json({ message: "Error updating finance entry", error });
  }
};

// 🗑️ Delete finance entry
export const deleteFinance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedEntry = await Finance.findByIdAndDelete(id);

    if (!deletedEntry) {
      return res.status(404).json({ message: "Finance entry not found" });
    }

    res.status(200).json({ message: "Finance entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting finance entry:", error);
    res.status(500).json({ message: "Error deleting finance entry", error });
  }
};
