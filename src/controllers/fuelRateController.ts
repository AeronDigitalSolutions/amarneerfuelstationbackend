import { Request, Response } from "express";
import { FuelRate } from "../models/FuelRates";

export const saveFuelRates = async (req: Request, res: Response) => {
  try {
    const { rates } = req.body;

    if (!rates || typeof rates !== "object") {
      return res.status(400).json({ message: "Rates object is required" });
    }

    let latest = await FuelRate.findOne().sort({ createdAt: -1 });

    if (latest) {
      latest.rates = rates;
      await latest.save();
      return res.json(latest);
    }

    const newRates = new FuelRate({ rates });
    await newRates.save();
    return res.status(201).json(newRates);
  } catch (err) {
    console.error("Error saving fuel rates:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getFuelRates = async (req: Request, res: Response) => {
  try {
    const latest = await FuelRate.findOne().sort({ createdAt: -1 });
    if (!latest) {
      return res.status(404).json({ message: "No fuel rates found" });
    }

    return res.json(latest);
  } catch (err) {
    console.error("Error fetching fuel rates:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};
