import { Router } from "express";
import { createPayment, getPayments } from "../controllers/payment";

const router = Router();

router.post("/", createPayment);
router.get("/", getPayments);

export default router;
