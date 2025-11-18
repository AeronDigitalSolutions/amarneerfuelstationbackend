import express from "express";
import {
  addSale,
  getAllSales,
  updateSale,
  deleteSale,
} from "../controllers/saleController";

const router = express.Router();

// ➕ Create sale
router.post("/", addSale);

// 📋 Get all sales
router.get("/", getAllSales);

// ✏️ Update sale
router.put("/:id", updateSale);

// 🗑️ Delete sale
router.delete("/:id", deleteSale);

export default router;
