import { Router } from "express";
import {
  createTank,
  getTanks,
  updateTank,
  deleteTank,
} from "../controllers/addtankcontroller";

const router = Router();

router.post("/", createTank);
router.get("/", getTanks);
router.put("/:id", updateTank);
router.delete("/:id", deleteTank);

export default router;
