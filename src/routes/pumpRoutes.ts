import express from "express";
import { createPump, getPumps } from "../controllers/pumpController";

const router = express.Router();

router.post("/", createPump);
router.get("/", getPumps);

export default router;
