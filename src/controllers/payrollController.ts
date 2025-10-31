import { Request, Response } from "express";
import Attendance from "../models/attendanceModels";
import Employee from "../models/employeeModels";

// ➕ Add Employee
export const addEmployee = async (req: Request, res: Response) => {
  try {
    const emp = await Employee.create(req.body);
    res.status(201).json(emp);
  } catch (error) {
    res.status(500).json({ message: "Error adding employee", error });
  }
};

// 📋 Get All Employees
export const getEmployees = async (_req: Request, res: Response) => {
  try {
    const emps = await Employee.find().sort({ createdAt: -1 });
    res.status(200).json(emps);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employees", error });
  }
};

// ✅ Add Attendance
export const addAttendance = async (req: Request, res: Response) => {
  try {
    const { employeeId, date, shift, inTime, outTime, status, overtimeHours } = req.body;

    const emp = await Employee.findById(employeeId);
    if (!emp) return res.status(404).json({ message: "Employee not found" });

    let salaryEarned = 0;
    if (emp.salaryType === "Monthly") {
      salaryEarned = status === "Present" ? emp.salaryAmount / 30 : 0;
    } else {
      salaryEarned = status === "Present" ? emp.salaryAmount : 0;
    }

    // Add overtime bonus (₹100/hr)
    salaryEarned += overtimeHours * 100;

    const attendance = await Attendance.create({
      employeeId,
      date,
      shift,
      inTime,
      outTime,
      status,
      overtimeHours,
      salaryEarned,
    });

    res.status(201).json(attendance);
  } catch (error) {
    console.error("Error adding attendance:", error);
    res.status(500).json({ message: "Error adding attendance", error });
  }
};

// 📋 Get All Attendance Records
export const getAllAttendance = async (_req: Request, res: Response) => {
  try {
    const records = await Attendance.find()
      .populate("employeeId", "name role")
      .sort({ date: -1 });

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Error fetching attendance records", error });
  }
};

// 📊 Get Payroll Summary (per employee)
export const getPayrollSummary = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const emp = await Employee.findById(employeeId);
    if (!emp) return res.status(404).json({ message: "Employee not found" });

    const records = await Attendance.find({ employeeId });
    const totalDays = records.length;
    const presentDays = records.filter(r => r.status === "Present").length;
    const totalSalary = records.reduce((sum, r) => sum + (r.salaryEarned || 0), 0);

    const summary = {
      name: emp.name,
      role: emp.role,
      salaryType: emp.salaryType,
      totalDays,
      presentDays,
      totalSalary,
    };

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payroll summary", error });
  }
};

// 🗑️ Delete Attendance
export const deleteAttendance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Attendance.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Attendance not found" });

    res.status(200).json({ message: "Attendance deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting attendance", error });
  }
};
