import { Request, Response } from "express";
import { Op } from "sequelize";
import Attendance from "../models/attendanceModels";
import Employee from "../models/employeeModels";
import Shift from "../models/Shift";
import { getPumpIdOrThrow } from "../middleware/pumpContext";

const toMinutes = (value: string): number => {
  if (!value) return 0;
  const text = value.trim().toUpperCase();

  const amPmMatch = text.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (amPmMatch) {
    let hour = Number(amPmMatch[1]) % 12;
    const minute = Number(amPmMatch[2]);
    if (amPmMatch[3] === "PM") hour += 12;
    return hour * 60 + minute;
  }

  const [hh, mm] = text.split(":").map(Number);
  if (Number.isFinite(hh) && Number.isFinite(mm)) return hh * 60 + mm;
  return 0;
};

const getShiftHours = (startTime: string, endTime: string): number => {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  const duration = end === start ? 24 * 60 : end > start ? end - start : 24 * 60 - start + end;
  return Number((duration / 60).toFixed(2));
};

const isValidMonthKey = (month: string) => /^\d{4}-(0[1-9]|1[0-2])$/.test(month);

const getMonthKey = (date: string) => String(date || "").slice(0, 7);

const recalculateMonthlyAttendancePayroll = async (pumpId: string, employee: any, monthKey: string) => {
  if (!isValidMonthKey(monthKey)) return;

  const rows = (await Attendance.findAll({
    where: {
      pumpId,
      employeeId: employee._id,
      date: { [Op.like]: `${monthKey}%` },
    },
    order: [["date", "ASC"], ["createdAt", "ASC"]],
  })) as any[];

  const monthlySalary = Number(employee.salaryAmount || 0);
  const grantedHolidays = Math.max(0, Math.floor(Number(employee.grantedHolidays || 0)));
  const perDaySalary = monthlySalary / 30;

  let paidLeaveUsed = 0;

  for (const row of rows) {
    const status = row.status === "Absent" ? "Absent" : "Present";
    const shiftHours =
      Number(row.shiftHours || 0) > 0
        ? Number(row.shiftHours || 0)
        : getShiftHours(String(row.shiftStartTime || ""), String(row.shiftEndTime || ""));
    const perHourSalary = shiftHours > 0 ? perDaySalary / shiftHours : 0;
    const overtimeHours = status === "Present" ? Math.max(0, Number(row.overtimeHours || 0)) : 0;
    const overtimePay = overtimeHours * perHourSalary;

    let salaryEarned = 0;
    if (status === "Present") {
      salaryEarned = perDaySalary + overtimePay;
    } else if (paidLeaveUsed < grantedHolidays) {
      salaryEarned = perDaySalary;
      paidLeaveUsed += 1;
    }

    await row.update({
      shiftHours: Number(shiftHours.toFixed(2)),
      perDaySalary: Number(perDaySalary.toFixed(2)),
      perHourSalary: Number(perHourSalary.toFixed(2)),
      overtimeHours: Number(overtimeHours.toFixed(2)),
      overtimePay: Number(overtimePay.toFixed(2)),
      salaryEarned: Number(salaryEarned.toFixed(2)),
    });
  }
};

export const addEmployee = async (req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(req);
    const name = String(req.body?.name || "").trim();
    const employmentTypeRaw = String(req.body?.employmentType || req.body?.role || "Full-time").trim();
    const employmentType = employmentTypeRaw === "Part-time" ? "Part-time" : "Full-time";
    const salaryAmount = Number(req.body?.salaryAmount ?? req.body?.monthlySalary ?? 0);
    const grantedHolidays = Number(req.body?.grantedHolidays ?? 0);

    if (!name) return res.status(400).json({ message: "Employee name is required" });
    if (!Number.isFinite(salaryAmount) || salaryAmount <= 0) {
      return res.status(400).json({ message: "Monthly salary must be greater than 0" });
    }
    if (!Number.isFinite(grantedHolidays) || grantedHolidays < 0) {
      return res.status(400).json({ message: "Granted holidays cannot be negative" });
    }

    const emp = await Employee.create({
      pumpId,
      name,
      role: employmentType,
      employmentType,
      salaryType: "Monthly",
      salaryAmount,
      grantedHolidays: Math.floor(grantedHolidays),
    });
    res.status(201).json(emp);
  } catch (error) {
    res.status(500).json({ message: "Error adding employee", error });
  }
};

export const getEmployees = async (_req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(_req);
    const emps = await Employee.findAll({ where: { pumpId }, order: [["createdAt", "DESC"]] });
    res.status(200).json(emps);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employees", error });
  }
};

export const addAttendance = async (req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(req);
    const { employeeId, date, shiftId, shift, status, overtimeHours } = req.body;

    const emp = await Employee.findOne({ where: { _id: employeeId, pumpId } });
    if (!emp) return res.status(404).json({ message: "Employee not found" });

    let resolvedShift: any = null;
    if (shiftId && typeof shiftId === "string") {
      resolvedShift = await Shift.findOne({ where: { _id: shiftId, pumpId } });
    } else if (shift && typeof shift === "string") {
      resolvedShift = await Shift.findOne({ where: { shiftName: shift, pumpId } });
    }

    if (!resolvedShift) {
      return res.status(400).json({ message: "Valid shift selection is required" });
    }

    const employee = emp as any;
    const recordDate =
      typeof date === "string" && date.trim() ? date.trim() : new Date().toISOString().split("T")[0];
    const normalizedStatus = status === "Absent" ? "Absent" : "Present";
    const extraHoursRaw = Number(overtimeHours || 0);
    const extraHours = normalizedStatus === "Present" && Number.isFinite(extraHoursRaw) && extraHoursRaw > 0 ? extraHoursRaw : 0;

    const monthlySalary = Number(employee.salaryAmount || 0);
    const perDaySalary = monthlySalary / 30;
    const shiftHours = getShiftHours(String(resolvedShift.startTime || ""), String(resolvedShift.endTime || ""));
    const perHourSalary = shiftHours > 0 ? perDaySalary / shiftHours : 0;
    const overtimePay = extraHours * perHourSalary;
    const salaryEarned = normalizedStatus === "Present" ? perDaySalary + overtimePay : 0;

    const attendance = await Attendance.create({
      pumpId,
      employeeId,
      date: recordDate,
      shiftId: resolvedShift._id,
      shift: resolvedShift.shiftName,
      shiftStartTime: resolvedShift.startTime,
      shiftEndTime: resolvedShift.endTime,
      inTime: resolvedShift.startTime,
      outTime: resolvedShift.endTime,
      status: normalizedStatus,
      overtimeHours: extraHours,
      shiftHours,
      perDaySalary,
      perHourSalary,
      overtimePay,
      salaryEarned,
    });

    const monthKey = getMonthKey(recordDate);
    await recalculateMonthlyAttendancePayroll(pumpId, employee, monthKey);

    const refreshed = await Attendance.findOne({ where: { _id: attendance._id, pumpId } });
    res.status(201).json(refreshed || attendance);
  } catch (error) {
    console.error("Error adding attendance:", error);
    res.status(500).json({ message: "Error adding attendance", error });
  }
};

export const getAllAttendance = async (_req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(_req);
    const records = (await Attendance.findAll({ where: { pumpId }, order: [["date", "DESC"]] })) as any[];
    const employeeIds = Array.from(new Set(records.map((r) => r.employeeId))).filter(Boolean);

    const employees = employeeIds.length
      ? ((await Employee.findAll({ where: { _id: { [Op.in]: employeeIds }, pumpId } })) as any[])
      : [];

    const empMap = new Map(employees.map((e) => [e._id, e]));

    const merged = records.map((r: any) => {
      const e = empMap.get(r.employeeId);
      return {
        ...r.toJSON(),
        employeeId: e
          ? {
              _id: e._id,
              name: e.name,
              role: e.role,
              employmentType: e.employmentType || e.role || "Full-time",
              salaryAmount: Number(e.salaryAmount || 0),
              grantedHolidays: Number(e.grantedHolidays || 0),
            }
          : { _id: r.employeeId, name: "Unknown", role: "Unknown", employmentType: "Unknown" },
        shiftInfo: {
          shiftId: r.shiftId || null,
          shiftName: r.shift || null,
          startTime: r.shiftStartTime || null,
          endTime: r.shiftEndTime || null,
        },
      };
    });

    res.status(200).json(merged);
  } catch (error) {
    res.status(500).json({ message: "Error fetching attendance records", error });
  }
};

export const getPayrollSummary = async (req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(req);
    const { employeeId } = req.params;
    const emp = await Employee.findOne({ where: { _id: employeeId, pumpId } });
    if (!emp) return res.status(404).json({ message: "Employee not found" });

    const records = (await Attendance.findAll({ where: { employeeId, pumpId } })) as any[];
    const totalDays = records.length;
    const presentDays = records.filter((r) => r.status === "Present").length;
    const totalSalary = records.reduce((sum, r) => sum + Number(r.salaryEarned || 0), 0);

    const employee = emp as any;

    const summary = {
      name: employee.name,
      role: employee.role || employee.employmentType,
      salaryType: employee.salaryType || "Monthly",
      totalDays,
      presentDays,
      totalSalary,
    };

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payroll summary", error });
  }
};

export const getEmployeeSalarySlip = async (req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(req);
    const { employeeId } = req.params;
    const monthQuery = String(req.query.month || "").trim();
    const bonusInput = Number(req.query.bonus || 0);
    const bonus = Number.isFinite(bonusInput) && bonusInput > 0 ? bonusInput : 0;

    const month =
      monthQuery && isValidMonthKey(monthQuery)
        ? monthQuery
        : new Date().toISOString().slice(0, 7);

    const emp = await Employee.findOne({ where: { _id: employeeId, pumpId } });
    if (!emp) return res.status(404).json({ message: "Employee not found" });

    const employee = emp as any;
    await recalculateMonthlyAttendancePayroll(pumpId, employee, month);

    const records = (await Attendance.findAll({
      where: { pumpId, employeeId, date: { [Op.like]: `${month}%` } },
      order: [["date", "ASC"], ["createdAt", "ASC"]],
    })) as any[];

    const monthlySalary = Number(employee.salaryAmount || 0);
    const perDaySalary = monthlySalary / 30;
    const grantedHolidays = Math.max(0, Math.floor(Number(employee.grantedHolidays || 0)));
    const presentDays = records.filter((r) => r.status === "Present").length;
    const absentDays = records.filter((r) => r.status === "Absent").length;
    const paidLeaveDays = Math.min(absentDays, grantedHolidays);
    const unpaidLeaveDays = Math.max(absentDays - grantedHolidays, 0);
    const overtimeHours = records.reduce((sum, r) => sum + Number(r.overtimeHours || 0), 0);
    const overtimePay = records.reduce((sum, r) => sum + Number(r.overtimePay || 0), 0);

    const basePay = Number(((presentDays + paidLeaveDays) * perDaySalary).toFixed(2));
    const deductionForUnpaidLeaves = Number((unpaidLeaveDays * perDaySalary).toFixed(2));
    const grossBeforeBonus = Number((basePay + overtimePay).toFixed(2));
    const totalPayable = Number((grossBeforeBonus + bonus).toFixed(2));

    return res.status(200).json({
      employee: {
        _id: employee._id,
        name: employee.name,
        employmentType: employee.employmentType || employee.role || "Full-time",
      },
      month,
      monthlySalary: Number(monthlySalary.toFixed(2)),
      perDaySalary: Number(perDaySalary.toFixed(2)),
      grantedHolidays,
      attendance: {
        totalEntries: records.length,
        presentDays,
        absentDays,
        paidLeaveDays,
        unpaidLeaveDays,
      },
      overtime: {
        hours: Number(overtimeHours.toFixed(2)),
        pay: Number(overtimePay.toFixed(2)),
      },
      deductions: {
        unpaidLeaveDeduction: deductionForUnpaidLeaves,
      },
      bonus: Number(bonus.toFixed(2)),
      salaryBreakup: {
        basePay,
        grossBeforeBonus,
        totalPayable,
      },
    });
  } catch (error) {
    console.error("Error generating salary slip:", error);
    return res.status(500).json({ message: "Error generating salary slip", error });
  }
};

export const deleteAttendance = async (req: Request, res: Response) => {
  try {
    const pumpId = getPumpIdOrThrow(req);
    const { id } = req.params;
    const record = await Attendance.findOne({ where: { _id: id, pumpId } });
    if (!record) return res.status(404).json({ message: "Attendance not found" });
    const row = record as any;
    const employeeId = row.employeeId;
    const monthKey = getMonthKey(String(row.date || ""));
    await record.destroy();

    const employee = await Employee.findOne({ where: { _id: employeeId, pumpId } });
    if (employee && isValidMonthKey(monthKey)) {
      await recalculateMonthlyAttendancePayroll(pumpId, employee as any, monthKey);
    }

    res.status(200).json({ message: "Attendance deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting attendance", error });
  }
};
