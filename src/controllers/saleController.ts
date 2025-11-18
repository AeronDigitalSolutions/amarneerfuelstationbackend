import { Request, Response } from "express";
import Sale from "../models/saleModel";

// Helper to compute litres & total safely
const computeSaleValues = (body: any) => {
  const opening = Number(body.openingMeter || 0);
  const closing = Number(body.closingMeter || 0);
  const testFuel = Number(body.testFuel || 0);
  const rate = Number(body.ratePerLitre || 0);

  let litres = closing - opening - testFuel;
  if (litres < 0) litres = 0;

  const totalAmount = litres * rate;

  return { litresSold: litres, totalAmount };
};

// ➕ Create new sale
export const addSale = async (req: Request, res: Response) => {
  try {
    const computed = computeSaleValues(req.body);

    const sale = await Sale.create({
      ...req.body,
      litresSold: computed.litresSold,
      totalAmount: computed.totalAmount,
    });

    res.status(201).json(sale);
  } catch (error: any) {
    res.status(500).json({ message: "Error saving sale", error: error.message });
  }
};

// 📋 Get all sales
export const getAllSales = async (req: Request, res: Response) => {
  try {
    const sales = await Sale.find().sort({ createdAt: -1 });
    res.json(sales);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching sales", error: error.message });
  }
};

// ✏️ Update sale
export const updateSale = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const computed = computeSaleValues(req.body);

    const updated = await Sale.findByIdAndUpdate(
      id,
      {
        ...req.body,
        litresSold: computed.litresSold,
        totalAmount: computed.totalAmount,
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Sale not found" });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: "Error updating sale", error: error.message });
  }
};

// 🗑️ Delete sale
export const deleteSale = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Sale.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ message: "Sale not found" });

    res.json({ message: "Sale deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting sale", error: error.message });
  }
};
