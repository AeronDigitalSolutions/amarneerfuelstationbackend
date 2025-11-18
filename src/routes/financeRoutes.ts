import express from "express";
import {
  addFinance,
  getAllFinance,
  getSummary,
  updateFinance,
  deleteFinance,
} from "../controllers/financeController";

const router = express.Router();

// ➕ Create new finance entry (Normal or Daily Expense)
router.post("/", addFinance);

// 📋 Fetch all finance entries
router.get("/", getAllFinance);

// 📊 Financial Summary (Sales, Purchase, Expense, Profit)
router.get("/summary", getSummary);

// ✏️ Update existing entry
router.put("/:id", updateFinance);

// 🗑️ Delete existing entry
router.delete("/:id", deleteFinance);

export default router;
