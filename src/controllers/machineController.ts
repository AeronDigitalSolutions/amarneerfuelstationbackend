import { Request, Response } from "express";
import { Machine } from "../models/Machine";

export const createMachine = async (req: Request, res: Response): Promise<void> => {
  try {
    const { machineNo, machineName, nozzles } = req.body;

    if (!machineNo || !machineName || !Array.isArray(nozzles)) {
      res.status(400).json({ message: "All fields are mandatory" });
      return;
    }

    if (nozzles.some((n: any) => !n.fuelType)) {
      res.status(400).json({ message: "Each nozzle must have a fuel type" });
      return;
    }

    const exists = await Machine.findOne({ where: { machineNo } });
    if (exists) {
      res.status(400).json({ message: "Machine number already exists" });
      return;
    }

    const machine = await Machine.create({ machineNo, machineName, nozzles });

    res.status(201).json(machine);
  } catch (err) {
    console.error("Error creating machine:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMachines = async (_req: Request, res: Response): Promise<void> => {
  try {
    const machines = await Machine.findAll({ order: [["createdAt", "DESC"]] });
    res.json(machines);
  } catch (err) {
    console.error("Error fetching machines:", err);
    res.status(500).json({ message: "Server error" });
  }
};
