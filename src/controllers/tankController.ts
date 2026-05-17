import { Request, Response } from "express";
import Tank from "../models/tankModel";

export const addTank = async (req: Request, res: Response) => {
  try {
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

    if (dateTime) payload.dateTime = dateTime;

    const newTank = await Tank.create(payload);
    res.status(201).json(newTank);
  } catch (error: any) {
    console.error("❌ Error creating tank:", error);
    res.status(500).json({ message: error.message || "Error creating tank" });
  }
};

export const getAllTanks = async (_req: Request, res: Response) => {
  try {
    const tanks = await Tank.findAll({ order: [["createdAt", "DESC"]] });
    res.status(200).json(tanks);
  } catch (error) {
    console.error("❌ Error fetching tanks:", error);
    res.status(500).json({ message: "Error fetching tanks", error });
  }
};

export const updateTank = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { invoiceDensity, chambers, ...rest } = req.body;

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

    const tank = await Tank.findByPk(id);
    if (!tank) return res.status(404).json({ message: "Tank not found" });

    await tank.update(updatePayload);
    res.json(tank);
  } catch (error) {
    console.error("❌ Error updating tank:", error);
    res.status(500).json({ message: "Error updating tank", error });
  }
};

export const deleteTank = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tank = await Tank.findByPk(id);
    if (!tank) return res.status(404).json({ message: "Tank not found" });

    await tank.destroy();
    res.json({ message: "Tank deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting tank:", error);
    res.status(500).json({ message: "Error deleting tank", error });
  }
};
