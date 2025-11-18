import { Request, Response } from "express";
import { Pump } from "../models/Pump";

// ✅ Create Pump
export const createPump = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pumpNo, pumpName, fuels } = req.body;

    if (!pumpNo || !pumpName || !Array.isArray(fuels)) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const existingPump = await Pump.findOne({ pumpNo });
    if (existingPump) {
      res.status(400).json({ message: "Pump number already exists" });
      return;
    }

    const newPump = new Pump({ pumpNo, pumpName, fuels });
    await newPump.save();

    res.status(201).json(newPump);
  } catch (err) {
    console.error("Error creating pump:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Fetch all Pumps
export const getPumps = async (req: Request, res: Response): Promise<void> => {
  try {
    const pumps = await Pump.find().sort({ createdAt: -1 });
    res.json(pumps);
  } catch (err) {
    console.error("Error fetching pumps:", err);
    res.status(500).json({ message: "Server error" });
  }
};
