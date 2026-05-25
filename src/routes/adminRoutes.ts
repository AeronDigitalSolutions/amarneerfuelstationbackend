import express from "express";
import {
  createUser,
  updateUser,
  getAllUsers,
  deleteUser,
  getActionLogs,
} from "../controllers/adminController";

const router = express.Router();

router.post("/admin/user", createUser);
router.put("/admin/user/:id", updateUser);
router.get("/admin/users", getAllUsers);
router.delete("/admin/user/:id", deleteUser);
router.get("/admin/logs", getActionLogs);

export default router;
