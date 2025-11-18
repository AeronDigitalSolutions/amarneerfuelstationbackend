import { Request, Response } from "express";
import TankMaster from "../models/addtank";

export const createTank = async (req: Request, res: Response) => {
  try {
    const tank = await TankMaster.create(req.body);
    res.status(201).json(tank);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getTanks = async (_req: Request, res: Response) => {
  try {
    const tanks = await TankMaster.find().sort({ createdAt: -1 });
    res.json(tanks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTank = async (req: Request, res: Response) => {
  try {
    const tank = await TankMaster.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(tank);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteTank = async (req: Request, res: Response) => {
  try {
    await TankMaster.findByIdAndDelete(req.params.id);
    res.json({ message: "Tank deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
