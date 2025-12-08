// controllers/tankController.ts
import { Request, Response } from "express";
import Tank from "../models/tankModel";

// ➕ Create Tank
export const addTank = async (req: Request, res: Response) => {
  try {
    // Validate minimal fields (you can expand validation)
    const {
      tankId,
      productType,
      capacity,
      openingStock,
      quantityReceived,
      soldQuantity,
      lowStockAlertLevel,
      ratePerLitre,
      closingStock,
      totalAmount,
      invoiceDensity,
      chambers,
      supplierName,
      tankerReceiptNo,
      receivedBy,
      remarks,
      dateTime,
    } = req.body;

    if (
      !tankId ||
      productType == null ||
      capacity == null ||
      openingStock == null ||
      quantityReceived == null ||
      soldQuantity == null ||
      lowStockAlertLevel == null ||
      ratePerLitre == null ||
      closingStock == null ||
      totalAmount == null
    ) {
      res.status(400).json({ message: "Required fields missing" });
      return;
    }

    const payload: any = {
      tankId,
      productType,
      capacity,
      openingStock,
      quantityReceived,
      soldQuantity,
      lowStockAlertLevel,
      ratePerLitre,
      closingStock,
      totalAmount,
      supplierName,
      tankerReceiptNo,
      receivedBy,
      remarks,
      invoiceDensity: invoiceDensity != null ? Number(invoiceDensity) : undefined,
      chambers: Array.isArray(chambers)
        ? chambers.map((c: any) => ({
            chamberName: c.chamberName,
            fuelDensity: Number(c.fuelDensity || 0),
          }))
        : [],
    };

    // allow optional dateTime to be saved as custom field (not part of schema timestamps)
    if (dateTime) payload.dateTime = dateTime;

    const newTank = await Tank.create(payload);
    res.status(201).json(newTank);
  } catch (error: any) {
    console.error("❌ Error creating tank:", error);
    res.status(500).json({ message: error.message || "Error creating tank" });
  }
};

// 📋 Get All Tanks
export const getAllTanks = async (req: Request, res: Response) => {
  try {
    const tanks = await Tank.find().sort({ createdAt: -1 });
    res.status(200).json(tanks);
  } catch (error) {
    console.error("❌ Error fetching tanks:", error);
    res.status(500).json({ message: "Error fetching tanks", error });
  }
};

// ✏️ Update Tank
export const updateTank = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      invoiceDensity,
      chambers,
      ...rest
    } = req.body;

    const updatePayload: any = {
      ...rest,
      invoiceDensity: invoiceDensity != null ? Number(invoiceDensity) : undefined,
      chambers: Array.isArray(chambers)
        ? chambers.map((c: any) => ({
            chamberName: c.chamberName,
            fuelDensity: Number(c.fuelDensity || 0),
          }))
        : undefined,
    };

    const updated = await Tank.findByIdAndUpdate(id, updatePayload, { new: true });
    if (!updated) return res.status(404).json({ message: "Tank not found" });
    res.json(updated);
  } catch (error) {
    console.error("❌ Error updating tank:", error);
    res.status(500).json({ message: "Error updating tank", error });
  }
};

// ❌ Delete Tank
export const deleteTank = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Tank.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Tank not found" });
    res.json({ message: "Tank deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting tank:", error);
    res.status(500).json({ message: "Error deleting tank", error });
  }
};
