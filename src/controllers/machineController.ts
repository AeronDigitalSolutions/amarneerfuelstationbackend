import { Request, Response } from "express";
import { Machine } from "../models/Machine";
import { getPumpIdOrThrow } from "../middleware/pumpContext";

export const createMachine = async (req: Request, res: Response): Promise<void> => {
  try {
    const pumpId = getPumpIdOrThrow(req);
    const { machineNo, machineName, nozzles } = req.body;

    if (!machineNo || !machineName || !Array.isArray(nozzles)) {
      res.status(400).json({ message: "All fields are mandatory" });
      return;
    }

    if (nozzles.some((n: any) => !n.fuelType)) {
      res.status(400).json({ message: "Each nozzle must have a fuel type" });
      return;
    }

    const exists = await Machine.findOne({ where: { machineNo, pumpId } });
    if (exists) {
      res.status(400).json({ message: "Machine number already exists" });
      return;
    }

    const machine = await Machine.create({ machineNo, machineName, nozzles, pumpId });

    res.status(201).json(machine);
  } catch (err) {
    console.error("Error creating machine:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMachines = async (_req: Request, res: Response): Promise<void> => {
  try {
    const pumpId = getPumpIdOrThrow(_req);
    const machines = await Machine.findAll({ where: { pumpId }, order: [["createdAt", "DESC"]] });
    res.json(machines);
  } catch (err) {
    console.error("Error fetching machines:", err);
    res.status(500).json({ message: "Server error" });
  }
};
