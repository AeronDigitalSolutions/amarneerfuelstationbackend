import { Request, Response } from "express";
import FuelTest from "../models/FuelTest";
import { Pump } from "../models/Pump";

/**
 * ----------------------------------------------------
 * SAVE FUEL TEST (Start/Stop Test)
 * ----------------------------------------------------
 */
export const saveFuelTest = async (req: Request, res: Response) => {
  try {
    const { pumpId, fuelType, liters, startTime, stopTime } = req.body;

    const pump = await Pump.findById(pumpId);
    if (!pump) return res.status(404).json({ message: "Pump not found" });

    const duration =
      (new Date(stopTime).getTime() - new Date(startTime).getTime()) / 1000;

    const newTest = await FuelTest.create({
      pumpId,
      pumpNo: pump.pumpNo,
      pumpName: pump.pumpName,
      fuelType,
      liters,
      startTime,
      stopTime,
      duration,
    });

    res.status(201).json({ message: "Fuel Test Saved", data: newTest });
  } catch (error) {
    console.error("Error saving fuel test:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * ----------------------------------------------------
 * GET ALL FUEL TEST RECORDS
 * ----------------------------------------------------
 */
export const getFuelTests = async (_req: Request, res: Response) => {
  try {
    const tests = await FuelTest.find().sort({ createdAt: -1 });
    res.json(tests);
  } catch (error) {
    console.error("Error getting fuel tests:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * ----------------------------------------------------
 * GET FUEL TEST BY PUMP + DATE (for Sale Entry Auto Fill)
 * ----------------------------------------------------
 * Example:
 * /fueltest/by-date?pumpId=123&date=2025-02-13
 */
export const getFuelTestByPumpAndDate = async (req: Request, res: Response) => {
  try {
    const { pumpId, date } = req.query;

    if (!pumpId || !date) {
      return res.status(400).json({
        message: "pumpId and date query params are required",
      });
    }

    const startOfDay = new Date(date as string);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date as string);
    endOfDay.setHours(23, 59, 59, 999);

    const tests = await FuelTest.find({
      pumpId,
      startTime: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ startTime: 1 });

    res.json(tests);
  } catch (error) {
    console.error("Error fetching test fuel by date:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
