import { Request, Response } from "express";
import Shift from "../models/Shift";
import { Op } from "sequelize";
import Attendance from "../models/attendanceModels";
import { getPumpIdOrThrow } from "../middleware/pumpContext";

const toMinutes = (value: string): number | null => {
  if (!value || typeof value !== "string") return null;
  const [hh, mm] = value.split(":").map(Number);
  if (!Number.isInteger(hh) || !Number.isInteger(mm)) return null;
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
  return hh * 60 + mm;
};

const isOvernight = (start: number, end: number) => end <= start;

const getDurationMinutes = (start: number, end: number) => {
  if (end === start) return 24 * 60;
  if (end > start) return end - start;
  return 24 * 60 - start + end;
};

const expandRanges = (start: number, end: number): Array<[number, number]> => {
  if (!isOvernight(start, end)) return [[start, end]];
  return [
    [start, 24 * 60],
    [0, end],
  ];
};

const rangesOverlap = (aStart: number, aEnd: number, bStart: number, bEnd: number) => {
  const aRanges = expandRanges(aStart, aEnd);
  const bRanges = expandRanges(bStart, bEnd);
  for (const [as, ae] of aRanges) {
    for (const [bs, be] of bRanges) {
      if (Math.max(as, bs) < Math.min(ae, be)) return true;
    }
  }
  return false;
};

const shiftType = (startMins: number) => {
  if (startMins >= 5 * 60 && startMins < 12 * 60) return "Morning";
  if (startMins >= 12 * 60 && startMins < 17 * 60) return "Day";
  if (startMins >= 17 * 60 && startMins < 22 * 60) return "Evening";
  return "Night";
};

const enrichShift = (shiftRow: any) => {
  const shift = shiftRow.toJSON ? shiftRow.toJSON() : shiftRow;
  const start = toMinutes(shift.startTime);
  const end = toMinutes(shift.endTime);
  const durationMinutes = start != null && end != null ? getDurationMinutes(start, end) : 0;
  return {
    ...shift,
    durationMinutes,
    durationHours: Number((durationMinutes / 60).toFixed(2)),
    overnight: start != null && end != null ? isOvernight(start, end) : false,
    shiftType: start != null ? shiftType(start) : "Custom",
  };
};

const validateShiftPayload = async (
  pumpId: string,
  payload: { shiftName?: string; startTime?: string; endTime?: string },
  excludeShiftId?: string
) => {
  const rawName = typeof payload.shiftName === "string" ? payload.shiftName.trim() : "";
  const start = typeof payload.startTime === "string" ? payload.startTime.trim() : "";
  const end = typeof payload.endTime === "string" ? payload.endTime.trim() : "";

  if (!rawName || !start || !end) {
    return { ok: false, status: 400, message: "shiftName, startTime and endTime are required" };
  }

  const startMins = toMinutes(start);
  const endMins = toMinutes(end);
  if (startMins == null || endMins == null) {
    return { ok: false, status: 400, message: "Time must be in HH:mm format" };
  }

  const existingByName = (await Shift.findOne({
    where: {
      pumpId,
      shiftName: rawName,
      ...(excludeShiftId ? { _id: { [Op.ne]: excludeShiftId } } : {}),
    },
    attributes: ["_id", "shiftName"],
  })) as any;

  if (existingByName) {
    return { ok: false, status: 409, message: `Shift name '${rawName}' already exists` };
  }

  const otherShifts = (await Shift.findAll({
    where: {
      pumpId,
      ...(excludeShiftId ? { _id: { [Op.ne]: excludeShiftId } } : {}),
    },
    attributes: ["_id", "shiftName", "startTime", "endTime"],
  })) as any[];

  for (const s of otherShifts) {
    const sStart = toMinutes(String(s.startTime));
    const sEnd = toMinutes(String(s.endTime));
    if (sStart == null || sEnd == null) continue;
    if (rangesOverlap(startMins, endMins, sStart, sEnd)) {
      return {
        ok: false,
        status: 409,
        message: `Shift timing overlaps with '${s.shiftName}' (${s.startTime}-${s.endTime})`,
      };
    }
  }

  return {
    ok: true,
    data: { shiftName: rawName, startTime: start, endTime: end },
  } as const;
};

export const addShift = async (req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(req);
    const validated = await validateShiftPayload(pumpId, req.body || {});
    if (!validated.ok) return res.status(validated.status).json({ message: validated.message });

    const shift = await Shift.create({ ...validated.data, notes: req.body?.notes || null, pumpId });
    res.status(201).json({ message: "Shift added", shift: enrichShift(shift) });
  } catch (error) {
    res.status(500).json({ message: "Error adding shift", error });
  }
};

export const getShifts = async (req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(req);
    const shifts = await Shift.findAll({ where: { pumpId }, order: [["createdAt", "DESC"]] });
    res.json((shifts as any[]).map((s) => enrichShift(s)));
  } catch (error) {
    res.status(500).json({ message: "Error fetching shifts", error });
  }
};

export const updateShift = async (req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(req);
    const shift = await Shift.findOne({ where: { _id: req.params.id, pumpId } });
    if (!shift) return res.status(404).json({ message: "Shift not found" });

    const validated = await validateShiftPayload(pumpId, req.body || {}, req.params.id);
    if (!validated.ok) return res.status(validated.status).json({ message: validated.message });
    const payload = validated.data!;

    await shift.update({ ...payload, notes: req.body?.notes || null });

    await Attendance.update(
      {
        shift: payload.shiftName,
        shiftStartTime: payload.startTime,
        shiftEndTime: payload.endTime,
      },
      { where: { pumpId, shiftId: req.params.id } }
    );

    res.json({ message: "Shift updated", shift: enrichShift(shift) });
  } catch (error) {
    res.status(500).json({ message: "Error updating shift", error });
  }
};

export const deleteShift = async (req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(req);
    const shift = await Shift.findOne({ where: { _id: req.params.id, pumpId } });
    if (!shift) return res.status(404).json({ message: "Shift not found" });

    const refCount = await Attendance.count({
      where: {
        pumpId,
        [Op.or]: [{ shiftId: req.params.id }, { shift: (shift as any).shiftName }],
      },
    });
    if (refCount > 0) {
      return res.status(409).json({
        message: "Cannot delete this shift because attendance records already use it",
      });
    }

    await shift.destroy();
    res.json({ message: "Shift deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting shift", error });
  }
};
