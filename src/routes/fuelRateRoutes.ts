import express from "express";
import { saveFuelRates, getFuelRates } from "../controllers/fuelRateController";

const router = express.Router();

router.post("/", saveFuelRates);
router.get("/", getFuelRates);

export default router;
