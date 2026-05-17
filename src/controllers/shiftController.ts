import { Request, Response } from "express";
import Shift from "../models/Shift";

export const addShift = async (req: Request, res: Response) => {
  try {
    const shift = await Shift.create(req.body);
    res.status(201).json({ message: "Shift added", shift });
  } catch (error) {
    res.status(500).json({ message: "Error adding shift", error });
  }
};

export const getShifts = async (_req: Request, res: Response) => {
  try {
    const shifts = await Shift.findAll({ order: [["createdAt", "DESC"]] });
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching shifts", error });
  }
};

export const updateShift = async (req: Request, res: Response) => {
  try {
    const shift = await Shift.findByPk(req.params.id);
    if (!shift) return res.status(404).json({ message: "Shift not found" });

    await shift.update(req.body);
    res.json({ message: "Shift updated", shift });
  } catch (error) {
    res.status(500).json({ message: "Error updating shift", error });
  }
};

export const deleteShift = async (req: Request, res: Response) => {
  try {
    const shift = await Shift.findByPk(req.params.id);
    if (!shift) return res.status(404).json({ message: "Shift not found" });

    await shift.destroy();
    res.json({ message: "Shift deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting shift", error });
  }
};
