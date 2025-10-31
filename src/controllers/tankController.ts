import { Request, Response } from "express";
import Tank from "../models/tankModel";

// ➕ Create Tank
export const addTank = async (req: Request, res: Response) => {
  try {
    const newTank = await Tank.create(req.body);
    res.status(201).json(newTank);
  } catch (error: any) {
    console.error("❌ Error creating tank:", error);
    res.status(500).json({ message: error.message || "Error creating tank" });
  }
};

// 📋 Get All Tanks
export const getAllTanks = async (req: Request, res: Response) => {
  try {
    const tanks = await Tank.find().sort({ createdAt: -1 });
    res.status(200).json(tanks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tanks", error });
  }
};

// ✏️ Update Tank
export const updateTank = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await Tank.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Tank not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating tank", error });
  }
};

// ❌ Delete Tank
export const deleteTank = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Tank.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Tank not found" });
    res.json({ message: "Tank deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting tank", error });
  }
};
