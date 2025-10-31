import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/userModel";
import ActionLog from "../models/actionLogModel";

// 🔐 Create a new user
export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role, performedBy } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
    });

    await ActionLog.create({
      user: performedBy,
      role: "Admin",
      action: `Created user ${username} with role ${role}`,
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};

// 👥 Get all users
export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

// 🗑️ Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) return res.status(404).json({ message: "User not found" });

    await ActionLog.create({
      user: "System Admin",
      role: "Admin",
      action: `Deleted user ${deletedUser.username}`,
    });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};

// 🧾 Get Action Logs
export const getActionLogs = async (_req: Request, res: Response) => {
  try {
    const logs = await ActionLog.find().sort({ createdAt: -1 });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching logs", error });
  }
};
