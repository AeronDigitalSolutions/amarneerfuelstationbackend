import { Router } from "express";
import {
  assignPrimarySuperAdminToPump,
  assignUsersToPump,
  createPump,
  getAccessiblePumps,
} from "../controllers/pumpController";

const router = Router();

router.get("/", getAccessiblePumps);
router.post("/", createPump);
router.put("/:pumpId/super-admin", assignPrimarySuperAdminToPump);
router.post("/:pumpId/access", assignUsersToPump);

export default router;
