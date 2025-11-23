import express from "express";
import { login } from "../controllers/authController";

const router = express.Router();

console.log("🔥 AUTH ROUTES LOADED");

// health check for quick debugging
router.get("/test", (_req, res) => res.json({ ok: true, msg: "auth route working" }));

router.post("/login", login);

export default router;
