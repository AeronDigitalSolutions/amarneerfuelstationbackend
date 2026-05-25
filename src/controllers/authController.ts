import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import User from "../models/userModel";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username/email and password are required" });
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email: username }],
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Invalid username or password" });
    }

    const userObj = user as any;
    const match = await bcrypt.compare(password, userObj.password);
    if (!match) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { userId: userObj._id, username: userObj.username, role: userObj.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: userObj._id,
        username: userObj.username,
        email: userObj.email,
        role: userObj.role,
        customRoleName: userObj.customRoleName || null,
        modulePermissions: userObj.modulePermissions || {},
      },
    });
  } catch (err) {
    console.error("Auth login error:", err);
    return res.status(500).json({ message: "Server Error", error: err });
  }
};
