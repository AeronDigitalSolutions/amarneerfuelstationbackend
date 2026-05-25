import { Request, Response } from "express";
import TankMaster from "../models/addtank";
import { getPumpIdOrThrow } from "../middleware/pumpContext";

const normalizeTank = (tank: any) => {
  const raw = typeof tank?.toJSON === "function" ? tank.toJSON() : tank;
  return {
    ...raw,
    tankId: raw?.name ?? raw?.tankId ?? "",
    fuelType: raw?.productType ?? raw?.fuelType ?? "",
  };
};

export const createTank = async (req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(req);
    const tankId = String(req.body?.tankId ?? req.body?.name ?? "").trim();
    const fuelType = String(req.body?.fuelType ?? req.body?.productType ?? "").trim();
    const capacity = Number(req.body?.capacity ?? 0);

    if (!tankId) {
      return res.status(400).json({ error: "Tank ID is required" });
    }
    if (!fuelType) {
      return res.status(400).json({ error: "Fuel type is required" });
    }
    if (!Number.isFinite(capacity) || capacity <= 0) {
      return res.status(400).json({ error: "Capacity must be greater than zero" });
    }

    const tank = await TankMaster.create({
      pumpId,
      name: tankId,
      productType: fuelType,
      capacity,
    });

    res.status(201).json(normalizeTank(tank));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getTanks = async (_req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(_req);
    const tanks = await TankMaster.findAll({ where: { pumpId }, order: [["createdAt", "DESC"]] });
    res.json(tanks.map(normalizeTank));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTank = async (req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(req);
    const tank = await TankMaster.findOne({ where: { _id: req.params.id, pumpId } });
    if (!tank) return res.status(404).json({ error: "Tank not found" });

    const nextName = String(req.body?.tankId ?? req.body?.name ?? tank.get("name") ?? "").trim();
    const nextProductType = String(
      req.body?.fuelType ?? req.body?.productType ?? tank.get("productType") ?? ""
    ).trim();
    const nextCapacityRaw = req.body?.capacity ?? tank.get("capacity");
    const nextCapacity = Number(nextCapacityRaw);

    if (!nextName) return res.status(400).json({ error: "Tank ID is required" });
    if (!nextProductType) return res.status(400).json({ error: "Fuel type is required" });
    if (!Number.isFinite(nextCapacity) || nextCapacity <= 0) {
      return res.status(400).json({ error: "Capacity must be greater than zero" });
    }

    await tank.update({
      name: nextName,
      productType: nextProductType,
      capacity: nextCapacity,
    });
    res.json(normalizeTank(tank));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteTank = async (req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(req);
    const tank = await TankMaster.findOne({ where: { _id: req.params.id, pumpId } });
    if (!tank) return res.status(404).json({ error: "Tank not found" });

    await tank.destroy();
    res.json({ message: "Tank deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
