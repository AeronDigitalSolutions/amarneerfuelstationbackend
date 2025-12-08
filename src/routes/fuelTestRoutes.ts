import express from "express";
import {
  saveFuelTest,
  getFuelTests,
  getFuelTestByMachineAndDate,
} from "../controllers/fuelTestController";

const router = express.Router();

router.post("/", saveFuelTest);
router.get("/", getFuelTests);

router.get("/by-date", getFuelTestByMachineAndDate);

export default router;
