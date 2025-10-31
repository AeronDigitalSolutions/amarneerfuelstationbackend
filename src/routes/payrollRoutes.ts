import express from "express";
import {
  addEmployee,
  getEmployees,
  addAttendance,
  getAllAttendance,
  deleteAttendance,
  getPayrollSummary,
} from "../controllers/payrollController";

const router = express.Router();

// Employee routes
router.post("/employee", addEmployee);
router.get("/employee", getEmployees);

// Attendance routes
router.post("/attendance", addAttendance);
router.get("/attendance", getAllAttendance); // ✅ this fixes the refresh issue
router.delete("/attendance/:id", deleteAttendance);

// Payroll summary
router.get("/payroll/:employeeId", getPayrollSummary);

export default router;
