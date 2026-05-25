import { Request, Response } from "express";
import { Op } from "sequelize";
import FuelTest from "../models/FuelTest";
import { Machine } from "../models/Machine";
import { getPumpIdOrThrow } from "../middleware/pumpContext";
import Shift from "../models/Shift";

type ShiftRow = {
  shiftName: string;
  startTime: string;
  endTime: string;
};

const toMinutes = (value: string): number | null => {
  if (!value || typeof value !== "string") return null;
  const [hh, mm] = value.split(":").map(Number);
  if (!Number.isInteger(hh) || !Number.isInteger(mm)) return null;
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
  return hh * 60 + mm;
};

const minuteInShift = (minute: number, start: number, end: number) => {
  if (end === start) return true;
  if (end > start) return minute >= start && minute < end;
  return minute >= start || minute < end;
};

const resolveShiftForDate = (dateInput: Date | string, shifts: ShiftRow[]) => {
  const at = new Date(dateInput);
  const minute = at.getHours() * 60 + at.getMinutes();
  for (const shift of shifts) {
    const start = toMinutes(String(shift.startTime || ""));
    const end = toMinutes(String(shift.endTime || ""));
    if (start == null || end == null) continue;
    if (minuteInShift(minute, start, end)) {
      return shift.shiftName;
    }
  }
  return null;
};

const loadShiftRows = async (pumpId: string): Promise<ShiftRow[]> => {
  const rows = (await Shift.findAll({
    where: { pumpId },
    attributes: ["shiftName", "startTime", "endTime"],
    order: [["createdAt", "ASC"]],
  })) as any[];

  return rows.map((r) => ({
    shiftName: String(r.shiftName || ""),
    startTime: String(r.startTime || ""),
    endTime: String(r.endTime || ""),
  }));
};

export const saveFuelTest = async (req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(req);
    const { machineId, nozzleNo, fuelType, liters, density, startTime, stopTime } = req.body;

    if (!machineId || !nozzleNo || !fuelType || liters == null || density == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const parsedLiters = Number(liters);
    const parsedDensity = Number(density);
    if (!Number.isFinite(parsedLiters) || parsedLiters <= 0) {
      return res.status(400).json({ message: "Liters must be greater than 0" });
    }
    if (!Number.isFinite(parsedDensity) || parsedDensity <= 0) {
      return res.status(400).json({ message: "Density must be greater than 0" });
    }

    const machine = await Machine.findOne({ where: { _id: machineId, pumpId } });
    if (!machine) return res.status(404).json({ message: "Machine not found" });

    const m = machine as any;
    const nozzles = Array.isArray(m.nozzles) ? m.nozzles : [];
    const nozzle = nozzles.find((n: any) => n.nozzleNo === Number(nozzleNo));
    if (!nozzle) return res.status(400).json({ message: "Nozzle not found in this machine" });

    const registeredAt = new Date();
    const resolvedStartTime = startTime ? new Date(startTime) : registeredAt;
    const resolvedStopTime = stopTime ? new Date(stopTime) : registeredAt;
    const duration = Math.max(0, (resolvedStopTime.getTime() - resolvedStartTime.getTime()) / 1000);
    const shiftRows = await loadShiftRows(pumpId);
    const inferredShift = resolveShiftForDate(resolvedStartTime, shiftRows);

    const newTest = await FuelTest.create({
      pumpId,
      machineId,
      machineNo: m.machineNo,
      machineName: m.machineName,
      nozzleNo: Number(nozzleNo),
      fuelType,
      liters: parsedLiters,
      density: parsedDensity,
      startTime: resolvedStartTime,
      stopTime: resolvedStopTime,
      duration,
    });

    const row = (newTest as any).toJSON ? (newTest as any).toJSON() : newTest;
    res.status(201).json({
      message: "Fuel Test Saved",
      data: {
        ...row,
        shiftName: inferredShift,
      },
    });
  } catch (error) {
    console.error("Error saving fuel test:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getFuelTests = async (req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(req);
    const tests = await FuelTest.findAll({ where: { pumpId }, order: [["createdAt", "DESC"]] });
    const shiftRows = await loadShiftRows(pumpId);
    const enriched = (tests as any[]).map((row) => {
      const test = row.toJSON ? row.toJSON() : row;
      return {
        ...test,
        shiftName: resolveShiftForDate(test.startTime, shiftRows),
      };
    });
    res.json(enriched);
  } catch (error) {
    console.error("Error getting fuel tests:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getFuelTestByMachineAndDate = async (req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(req);
    const { machineId, nozzleNo, date, shift } = req.query;

    if (!machineId || !nozzleNo || !date) {
      return res.status(400).json({ message: "machineId, nozzleNo & date are required" });
    }

    const startOfDay = new Date(String(date));
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(String(date));
    endOfDay.setHours(23, 59, 59, 999);

    const tests = await FuelTest.findAll({
      where: {
        machineId,
        pumpId,
        nozzleNo: Number(nozzleNo),
        startTime: { [Op.between]: [startOfDay, endOfDay] },
      },
      order: [["startTime", "ASC"]],
    });

    const shiftRows = await loadShiftRows(pumpId);
    const shiftFilter = typeof shift === "string" ? shift.trim().toLowerCase() : "";

    const enriched = (tests as any[]).map((row) => {
      const test = row.toJSON ? row.toJSON() : row;
      return {
        ...test,
        shiftName: resolveShiftForDate(test.startTime, shiftRows),
      };
    });

    const filtered = shiftFilter
      ? enriched.filter((t: any) => String(t.shiftName || "").trim().toLowerCase() === shiftFilter)
      : enriched;

    res.json(filtered);
  } catch (error) {
    console.error("Error fetching fuel test by date:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
