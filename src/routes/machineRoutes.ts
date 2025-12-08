// routes/machineRoutes.ts
import express from "express";
import { createMachine, getMachines } from "../controllers/machineController";

const router = express.Router();

router.post("/", createMachine);
router.get("/", getMachines);

export default router;
