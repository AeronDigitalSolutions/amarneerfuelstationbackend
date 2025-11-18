import { Request, Response } from "express";
import { FuelRate } from "../models/FuelRates";

export const saveFuelRates = async (req: Request, res: Response): Promise<void> => {
  try {
    const { petrol, diesel, premiumPetrol, cng } = req.body;

    if ([petrol, diesel, premiumPetrol, cng].some((r) => r == null)) {
      res.status(400).json({ message: "All rates are required" });
      return;
    }

    const existing = await FuelRate.findOne().sort({ createdAt: -1 });
    if (existing) {
      existing.petrol = petrol;
      existing.diesel = diesel;
      existing.premiumPetrol = premiumPetrol;
      existing.cng = cng;
      await existing.save();
      res.json(existing);
      return;
    }

    const newRate = new FuelRate({ petrol, diesel, premiumPetrol, cng });
    await newRate.save();
    res.status(201).json(newRate);
  } catch (err) {
    console.error("Error saving fuel rates:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getFuelRates = async (req: Request, res: Response): Promise<void> => {
  try {
    const latest = await FuelRate.findOne().sort({ createdAt: -1 });
    if (!latest) {
      res.status(404).json({ message: "No rates found" });
      return;
    }
    res.json(latest);
  } catch (err) {
    console.error("Error fetching fuel rates:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
