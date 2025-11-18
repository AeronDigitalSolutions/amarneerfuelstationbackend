import express from "express";
import {
  addShift,
  getShifts,
  updateShift,
  deleteShift,
} from "../controllers/shiftController";

const router = express.Router();

router.post("/", addShift);
router.get("/", getShifts);
router.put("/:id", updateShift);
router.delete("/:id", deleteShift);

export default router;
