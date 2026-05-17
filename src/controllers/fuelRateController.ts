import { Request, Response } from "express";
import { FuelRate } from "../models/FuelRates";

export const saveFuelRates = async (req: Request, res: Response) => {
  try {
    const { rates } = req.body;

    if (!rates || typeof rates !== "object") {
      return res.status(400).json({ message: "Rates object is required" });
    }

    const latest = await FuelRate.findOne({ order: [["createdAt", "DESC"]] });

    if (latest) {
      await latest.update({ rates });
      return res.json(latest);
    }

    const newRates = await FuelRate.create({ rates });
    return res.status(201).json(newRates);
  } catch (err) {
    console.error("Error saving fuel rates:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getFuelRates = async (_req: Request, res: Response) => {
  try {
    const latest = await FuelRate.findOne({ order: [["createdAt", "DESC"]] });
    if (!latest) {
      return res.status(404).json({ message: "No fuel rates found" });
    }

    return res.json(latest);
  } catch (err) {
    console.error("Error fetching fuel rates:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};
