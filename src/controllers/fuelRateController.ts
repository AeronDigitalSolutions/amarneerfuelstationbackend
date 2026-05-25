import { Request, Response } from "express";
import { FuelRate } from "../models/FuelRates";
import { getPumpIdOrThrow } from "../middleware/pumpContext";

export const saveFuelRates = async (req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(req);
    const { rates } = req.body;

    if (!rates || typeof rates !== "object") {
      return res.status(400).json({ message: "Rates object is required" });
    }

    const latest = await FuelRate.findOne({ where: { pumpId }, order: [["createdAt", "DESC"]] });

    if (latest) {
      await latest.update({ rates, pumpId });
      return res.json(latest);
    }

    const newRates = await FuelRate.create({ rates, pumpId });
    return res.status(201).json(newRates);
  } catch (err) {
    console.error("Error saving fuel rates:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getFuelRates = async (_req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(_req);
    const latest = await FuelRate.findOne({ where: { pumpId }, order: [["createdAt", "DESC"]] });
    if (!latest) {
      return res.status(404).json({ message: "No fuel rates found" });
    }

    return res.json(latest);
  } catch (err) {
    console.error("Error fetching fuel rates:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};
