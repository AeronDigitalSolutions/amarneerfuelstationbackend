import { Request, Response } from "express";
import { Op } from "sequelize";
import crypto from "crypto";
import PetrolPump from "../models/petrolPumpModel";
import PumpUserAccess from "../models/pumpUserAccessModel";
import User from "../models/userModel";

const ensureRequester = (req: Request, res: Response) => {
  const role = req.requesterRole;
  const userId = req.requesterUserId;
  if (!role || !userId) {
    res.status(401).json({ message: "Missing requester context. Please login again." });
    return null;
  }
  return { role, userId };
};

const generateIsolationKey = () => `pp-${crypto.randomBytes(12).toString("hex")}`;

const validateSuperAdmin = async (superAdminUserId: string) => {
  const user = (await User.findOne({
    where: { _id: superAdminUserId, role: "SuperAdmin" },
    attributes: ["_id", "username", "email", "role"],
  })) as any;
  return user || null;
};

const listPumpsForUser = async (role: "Owner" | "SuperAdmin" | "Admin", userId: string) => {
  if (role === "Owner") {
    return PetrolPump.findAll({
      where: { ownerUserId: userId, isActive: true },
      order: [["createdAt", "DESC"]],
    });
  }

  const mappings = (await PumpUserAccess.findAll({ where: { userId } })) as any[];
  const pumpIds = mappings.map((m) => m.pumpId).filter(Boolean);
  if (pumpIds.length === 0) return [];

  return PetrolPump.findAll({
    where: { _id: { [Op.in]: pumpIds }, isActive: true },
    order: [["createdAt", "DESC"]],
  });
};

export const createPump = async (req: Request, res: Response) => {
  try {
    const requester = ensureRequester(req, res);
    if (!requester) return;
    if (requester.role !== "Owner") {
      return res.status(403).json({ message: "Only Owner can create petrol pumps" });
    }

    const { name, code, location } = req.body;
    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Pump name is required" });
    }

    const normalizedCode =
      (typeof code === "string" && code.trim() ? code.trim().toUpperCase() : `PUMP-${Date.now()}`) ||
      `PUMP-${Date.now()}`;

    const exists = await PetrolPump.findOne({ where: { code: normalizedCode } });
    if (exists) return res.status(400).json({ message: "Pump code already exists" });

    const pump = await PetrolPump.create({
      ownerUserId: requester.userId,
      primarySuperAdminUserId: null,
      name: name.trim(),
      code: normalizedCode,
      location: typeof location === "string" ? location.trim() : null,
      dataIsolationKey: generateIsolationKey(),
      isActive: true,
    });

    await PumpUserAccess.findOrCreate({
      where: { pumpId: (pump as any)._id, userId: requester.userId },
      defaults: { grantedByUserId: requester.userId },
    });

    return res.status(201).json(pump);
  } catch (error) {
    console.error("Error creating pump:", error);
    return res.status(500).json({ message: "Error creating pump", error });
  }
};

export const getAccessiblePumps = async (req: Request, res: Response) => {
  try {
    const requester = ensureRequester(req, res);
    if (!requester) return;
    const pumps = await listPumpsForUser(requester.role, requester.userId);
    return res.status(200).json(pumps);
  } catch (error) {
    console.error("Error fetching pumps:", error);
    return res.status(500).json({ message: "Error fetching pumps", error });
  }
};

export const assignUsersToPump = async (req: Request, res: Response) => {
  try {
    const requester = ensureRequester(req, res);
    if (!requester) return;
    if (requester.role !== "Owner") {
      return res.status(403).json({ message: "Only Owner can assign users to pumps" });
    }

    const { pumpId } = req.params;
    const { userIds } = req.body as { userIds?: string[] };

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "userIds array is required" });
    }

    const pump = (await PetrolPump.findByPk(pumpId)) as any;
    if (!pump) return res.status(404).json({ message: "Pump not found" });
    if (pump.ownerUserId !== requester.userId) {
      return res.status(403).json({ message: "You can only assign users for your own pumps" });
    }

    const users = (await User.findAll({
      where: { _id: { [Op.in]: userIds }, role: "Admin" },
      attributes: ["_id", "role"],
    })) as any[];

    for (const user of users) {
      await PumpUserAccess.findOrCreate({
        where: { pumpId, userId: user._id },
        defaults: { grantedByUserId: requester.userId },
      });
    }

    return res.status(200).json({ message: "User access assigned", assignedCount: users.length });
  } catch (error) {
    console.error("Error assigning pump access:", error);
    return res.status(500).json({ message: "Error assigning users", error });
  }
};

export const assignPrimarySuperAdminToPump = async (req: Request, res: Response) => {
  try {
    const requester = ensureRequester(req, res);
    if (!requester) return;
    if (requester.role !== "Owner") {
      return res.status(403).json({ message: "Only Owner can assign SuperAdmin to pumps" });
    }

    const { pumpId } = req.params;
    const { superAdminUserId, forceSwitch } = req.body as { superAdminUserId?: string | null; forceSwitch?: boolean };

    const pump = (await PetrolPump.findByPk(pumpId)) as any;
    if (!pump) return res.status(404).json({ message: "Pump not found" });
    if (pump.ownerUserId !== requester.userId) {
      return res.status(403).json({ message: "You can only update your own pumps" });
    }

    const previousSuperAdminUserId = (pump as any).primarySuperAdminUserId || null;

    if (!superAdminUserId) {
      await pump.update({ primarySuperAdminUserId: null });
      if (previousSuperAdminUserId) {
        await PumpUserAccess.destroy({
          where: {
            pumpId,
            userId: previousSuperAdminUserId,
          },
        });
      }
      return res.status(200).json({ message: "Primary SuperAdmin unassigned", pump });
    }

    const superAdmin = await validateSuperAdmin(superAdminUserId);
    if (!superAdmin) {
      return res.status(404).json({ message: "Selected SuperAdmin not found" });
    }

    const existingAssignment = (await PetrolPump.findOne({
      where: {
        primarySuperAdminUserId: superAdminUserId,
        isActive: true,
        _id: { [Op.ne]: pumpId },
      },
      attributes: ["_id", "name", "code"],
    })) as any;

    if (existingAssignment) {
      if (!forceSwitch) {
        return res.status(409).json({
          message: `This SuperAdmin is already assigned to ${existingAssignment.name} (${existingAssignment.code}). Use forceSwitch to move assignment.`,
        });
      }

      await existingAssignment.update({ primarySuperAdminUserId: null });
      await PumpUserAccess.destroy({
        where: {
          pumpId: existingAssignment._id,
          userId: superAdminUserId,
        },
      });
    }

    await pump.update({ primarySuperAdminUserId: superAdminUserId });

    await PumpUserAccess.destroy({
      where: {
        userId: superAdminUserId,
        pumpId: { [Op.ne]: pumpId },
      },
    });
    await PumpUserAccess.findOrCreate({
      where: { pumpId, userId: superAdminUserId },
      defaults: { grantedByUserId: requester.userId },
    });

    if (previousSuperAdminUserId && previousSuperAdminUserId !== superAdminUserId) {
      await PumpUserAccess.destroy({
        where: {
          pumpId,
          userId: previousSuperAdminUserId,
        },
      });
    }

    return res.status(200).json({ message: "Primary SuperAdmin assigned", pump });
  } catch (error) {
    console.error("Error assigning SuperAdmin:", error);
    return res.status(500).json({ message: "Error assigning SuperAdmin", error });
  }
};
