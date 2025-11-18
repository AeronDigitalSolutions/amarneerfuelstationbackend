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

export const getShifts = async (req: Request, res: Response) => {
  try {
    const shifts = await Shift.find();
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching shifts", error });
  }
};

export const updateShift = async (req: Request, res: Response) => {
  try {
    const updated = await Shift.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json({ message: "Shift updated", shift: updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating shift", error });
  }
};

export const deleteShift = async (req: Request, res: Response) => {
  try {
    await Shift.findByIdAndDelete(req.params.id);
    res.json({ message: "Shift deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting shift", error });
  }
};
