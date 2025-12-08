import { Request, Response } from "express";
import FuelTest from "../models/FuelTest";
import { Machine } from "../models/Machine";

/**
 * SAVE FUEL TEST (Start/Stop)
 */
export const saveFuelTest = async (req: Request, res: Response) => {
  try {
    const { machineId, nozzleNo, fuelType, liters, startTime, stopTime } = req.body;

    if (!machineId || !nozzleNo || !fuelType || !liters) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const machine = await Machine.findById(machineId);
    if (!machine) return res.status(404).json({ message: "Machine not found" });

    const nozzle = machine.nozzles.find((n) => n.nozzleNo === Number(nozzleNo));
    if (!nozzle) return res.status(400).json({ message: "Nozzle not found in this machine" });

    const duration =
      (new Date(stopTime).getTime() - new Date(startTime).getTime()) / 1000;

    const newTest = await FuelTest.create({
      machineId,
      machineNo: machine.machineNo,
      machineName: machine.machineName,
      nozzleNo: Number(nozzleNo),
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
 * GET ALL FUEL TESTS
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
 * GET TEST FUEL BY MACHINE + NOZZLE + DATE
 */
export const getFuelTestByMachineAndDate = async (req: Request, res: Response) => {
  try {
    const { machineId, nozzleNo, date } = req.query;

    if (!machineId || !nozzleNo || !date) {
      return res.status(400).json({
        message: "machineId, nozzleNo & date are required",
      });
    }

    const startOfDay = new Date(date as string);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date as string);
    endOfDay.setHours(23, 59, 59, 999);

    const tests = await FuelTest.find({
      machineId,
      nozzleNo: Number(nozzleNo),
      startTime: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ startTime: 1 });

    res.json(tests);
  } catch (error) {
    console.error("Error fetching fuel test by date:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
