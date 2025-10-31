import express from "express";
import { addTank, getAllTanks, updateTank, deleteTank } from "../controllers/tankController";

const router = express.Router();

router.post("/", addTank);
router.get("/", getAllTanks);
router.put("/:id", updateTank);
router.delete("/:id", deleteTank);

export default router;
