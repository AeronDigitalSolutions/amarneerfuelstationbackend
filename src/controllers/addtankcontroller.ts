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
    const tanks = await TankMaster.findAll({ order: [["createdAt", "DESC"]] });
    res.json(tanks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTank = async (req: Request, res: Response) => {
  try {
    const tank = await TankMaster.findByPk(req.params.id);
    if (!tank) return res.status(404).json({ error: "Tank not found" });

    await tank.update(req.body);
    res.json(tank);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteTank = async (req: Request, res: Response) => {
  try {
    const tank = await TankMaster.findByPk(req.params.id);
    if (!tank) return res.status(404).json({ error: "Tank not found" });

    await tank.destroy();
    res.json({ message: "Tank deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
