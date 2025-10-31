import { Request, Response } from "express";
import Sale from "../models/saleModel";

// ✅ Add new sale
export const addSale = async (req: Request, res: Response) => {
  try {
    const sale = await Sale.create(req.body);
    res.status(201).json(sale);
  } catch (error: any) {
    res.status(500).json({ message: "Error saving sale", error: error.message });
  }
};

// ✅ Get all sales
export const getAllSales = async (req: Request, res: Response) => {
  try {
    const sales = await Sale.find().sort({ createdAt: -1 });
    res.json(sales);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching sales", error: error.message });
  }
};

// ✅ Update sale (for Edit feature)
export const updateSale = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await Sale.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Sale not found" });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: "Error updating sale", error: error.message });
  }
};
