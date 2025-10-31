import express from "express";
import {
  addFinance,
  getAllFinance,
  getSummary,
  updateFinance,
  deleteFinance,
} from "../controllers/financeController";

const router = express.Router();

router.post("/", addFinance);
router.get("/", getAllFinance);
router.get("/summary", getSummary);
router.put("/:id", updateFinance);    // ✏️ Update existing entry
router.delete("/:id", deleteFinance); // 🗑️ Delete existing entry

export default router;
