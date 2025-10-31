import express from "express";
import { addSale, getAllSales, updateSale } from "../controllers/saleController";

const router = express.Router();

// Create sale
router.post("/", addSale);

// Get all sales
router.get("/", getAllSales);

// Update sale (Edit)
router.put("/:id", updateSale);

export default router;
