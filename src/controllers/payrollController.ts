import { Request, Response } from "express";
import { Op } from "sequelize";
import Attendance from "../models/attendanceModels";
import Employee from "../models/employeeModels";

export const addEmployee = async (req: Request, res: Response) => {
  try {
    const emp = await Employee.create(req.body);
    res.status(201).json(emp);
  } catch (error) {
    res.status(500).json({ message: "Error adding employee", error });
  }
};

export const getEmployees = async (_req: Request, res: Response) => {
  try {
    const emps = await Employee.findAll({ order: [["createdAt", "DESC"]] });
    res.status(200).json(emps);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employees", error });
  }
};

export const addAttendance = async (req: Request, res: Response) => {
  try {
    const { employeeId, date, shift, inTime, outTime, status, overtimeHours } = req.body;

    const emp = await Employee.findByPk(employeeId);
    if (!emp) return res.status(404).json({ message: "Employee not found" });

    const employee = emp as any;
    const extraHours = Number(overtimeHours || 0);

    let salaryEarned = 0;
    if (employee.salaryType === "Monthly") {
      salaryEarned = status === "Present" ? Number(employee.salaryAmount || 0) / 30 : 0;
    } else {
      salaryEarned = status === "Present" ? Number(employee.salaryAmount || 0) : 0;
    }

    salaryEarned += extraHours * 100;

    const attendance = await Attendance.create({
      employeeId,
      date,
      shift,
      inTime,
      outTime,
      status,
      overtimeHours: extraHours,
      salaryEarned,
    });

    res.status(201).json(attendance);
  } catch (error) {
    console.error("Error adding attendance:", error);
    res.status(500).json({ message: "Error adding attendance", error });
  }
};

export const getAllAttendance = async (_req: Request, res: Response) => {
  try {
    const records = (await Attendance.findAll({ order: [["date", "DESC"]] })) as any[];
    const employeeIds = Array.from(new Set(records.map((r) => r.employeeId))).filter(Boolean);

    const employees = employeeIds.length
      ? ((await Employee.findAll({ where: { _id: { [Op.in]: employeeIds } } })) as any[])
      : [];

    const empMap = new Map(employees.map((e) => [e._id, e]));

    const merged = records.map((r: any) => {
      const e = empMap.get(r.employeeId);
      return {
        ...r.toJSON(),
        employeeId: e
          ? { _id: e._id, name: e.name, role: e.role }
          : { _id: r.employeeId, name: "Unknown", role: "Unknown" },
      };
    });

    res.status(200).json(merged);
  } catch (error) {
    res.status(500).json({ message: "Error fetching attendance records", error });
  }
};

export const getPayrollSummary = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const emp = await Employee.findByPk(employeeId);
    if (!emp) return res.status(404).json({ message: "Employee not found" });

    const records = (await Attendance.findAll({ where: { employeeId } })) as any[];
    const totalDays = records.length;
    const presentDays = records.filter((r) => r.status === "Present").length;
    const totalSalary = records.reduce((sum, r) => sum + Number(r.salaryEarned || 0), 0);

    const employee = emp as any;

    const summary = {
      name: employee.name,
      role: employee.role,
      salaryType: employee.salaryType,
      totalDays,
      presentDays,
      totalSalary,
    };

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payroll summary", error });
  }
};

export const deleteAttendance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const record = await Attendance.findByPk(id);
    if (!record) return res.status(404).json({ message: "Attendance not found" });

    await record.destroy();
    res.status(200).json({ message: "Attendance deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting attendance", error });
  }
};
