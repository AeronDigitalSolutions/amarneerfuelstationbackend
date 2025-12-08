import express from "express";
import { saveFuelRates, getFuelRates } from "../controllers/fuelRateController";

const router = express.Router();

router.get("/", getFuelRates);
router.post("/", saveFuelRates);

export default router;
