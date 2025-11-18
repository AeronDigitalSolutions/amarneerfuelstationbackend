import express from "express";
import {
  saveFuelTest,
  getFuelTests,
  getFuelTestByPumpAndDate,
} from "../controllers/fuelTestController";

const router = express.Router();

router.post("/", saveFuelTest);
router.get("/", getFuelTests);

// ⭐ NEW ROUTE for Sale Entry auto test fuel
router.get("/by-date", getFuelTestByPumpAndDate);

export default router;
