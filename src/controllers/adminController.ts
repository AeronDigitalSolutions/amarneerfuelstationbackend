import { Request, Response } from "express";
import { Op } from "sequelize";
import bcrypt from "bcryptjs";
import User from "../models/userModel";
import ActionLog from "../models/actionLogModel";
import PetrolPump from "../models/petrolPumpModel";
import PumpUserAccess from "../models/pumpUserAccessModel";

const PLATFORM_ROLES = ["Owner", "SuperAdmin", "Admin"] as const;
type PlatformRole = (typeof PLATFORM_ROLES)[number];

const normalizeRole = (value: unknown): PlatformRole | null => {
  if (typeof value !== "string") return null;
  if ((PLATFORM_ROLES as readonly string[]).includes(value)) return value as PlatformRole;
  return null;
};

const canCreateRole = (creatorRole: PlatformRole, targetRole: PlatformRole): boolean => {
  if (creatorRole === "Owner") return targetRole === "SuperAdmin" || targetRole === "Admin";
  if (creatorRole === "SuperAdmin") return targetRole === "Admin";
  return false;
};

const sanitizePermissions = (input: any): Record<string, boolean> => {
  if (!input || typeof input !== "object") return {};
  const out: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(input)) {
    out[key] = Boolean(value);
  }
  return out;
};

const getRequesterRole = (req: Request): PlatformRole | null => {
  return (
    normalizeRole(req.body?.requesterRole) ||
    normalizeRole(req.query?.requesterRole) ||
    normalizeRole(req.headers["x-requester-role"])
  );
};

const getRequesterName = (req: Request): string => {
  const fromBody = req.body?.performedBy;
  const fromHeader = req.headers["x-requester-name"];
  if (typeof fromBody === "string" && fromBody.trim()) return fromBody.trim();
  if (typeof fromHeader === "string" && fromHeader.trim()) return fromHeader.trim();
  return "System";
};

const getRequesterUserId = (req: Request): string | null => {
  const fromBody = req.body?.requesterUserId;
  const fromHeaderA = req.headers["x-requester-user-id"];
  const fromHeaderB = req.headers["x-user-id"];
  const fromQuery = req.query?.requesterUserId;

  const value =
    (typeof fromBody === "string" && fromBody.trim()) ||
    (typeof fromHeaderA === "string" && fromHeaderA.trim()) ||
    (typeof fromHeaderB === "string" && fromHeaderB.trim()) ||
    (typeof fromQuery === "string" && fromQuery.trim()) ||
    "";

  return value || null;
};

const getAccessiblePumpIdsForUser = async (role: PlatformRole, userId: string): Promise<string[]> => {
  if (role === "Owner") {
    const pumps = (await PetrolPump.findAll({
      where: { ownerUserId: userId, isActive: true },
      attributes: ["_id"],
    })) as any[];
    return pumps.map((p) => p._id);
  }

  const mappings = (await PumpUserAccess.findAll({
    where: { userId },
    attributes: ["pumpId"],
  })) as any[];
  return mappings.map((m) => m.pumpId);
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const requesterRole = getRequesterRole(req);
    if (!requesterRole || (requesterRole !== "Owner" && requesterRole !== "SuperAdmin")) {
      return res.status(403).json({ message: "Only Owner or SuperAdmin can create users" });
    }

    const { username, email, password, role, customRoleName, modulePermissions } = req.body;
    const targetRole = normalizeRole(role);

    if (!username || !email || !password || !targetRole) {
      return res.status(400).json({ message: "username, email, password and valid role are required" });
    }

    if (!canCreateRole(requesterRole, targetRole)) {
      return res.status(403).json({ message: `Role ${requesterRole} cannot create ${targetRole}` });
    }

    const requesterUserId = getRequesterUserId(req);
    if (!requesterUserId) {
      return res.status(400).json({ message: "requesterUserId is required" });
    }

    const existing = await User.findOne({
      where: { email },
    });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) return res.status(400).json({ message: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const normalizedCustomRoleName =
      targetRole === "Admin" && typeof customRoleName === "string" && customRoleName.trim()
        ? customRoleName.trim()
        : null;

    const normalizedPermissions = targetRole === "Admin" ? sanitizePermissions(modulePermissions) : {};

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: targetRole,
      customRoleName: normalizedCustomRoleName,
      modulePermissions: normalizedPermissions,
    });

    const requestedPumpIds = Array.isArray(req.body?.pumpIds)
      ? req.body.pumpIds.filter((v: any) => typeof v === "string" && v.trim())
      : [];

    if (targetRole === "SuperAdmin" && requestedPumpIds.length > 0) {
      return res.status(400).json({
        message: "Assign SuperAdmin to pump only from SuperAdmin Management module",
      });
    }

    const accessiblePumpIds = await getAccessiblePumpIdsForUser(requesterRole, requesterUserId);
    const allowedPumpIds = targetRole === "Admin" && requestedPumpIds.length
      ? requestedPumpIds.filter((id: string) => accessiblePumpIds.includes(id))
      : targetRole === "Admin"
        ? accessiblePumpIds
        : [];

    for (const pumpId of allowedPumpIds) {
      await PumpUserAccess.findOrCreate({
        where: { pumpId, userId: (newUser as any)._id },
        defaults: { grantedByUserId: requesterUserId },
      });
    }

    await ActionLog.create({
      user: getRequesterName(req),
      role: requesterRole,
      action: `Created user ${username} with role ${targetRole} for ${allowedPumpIds.length} pumps`,
    });

    const userObj = newUser.toJSON();
    delete (userObj as any).password;
    res.status(201).json(userObj);
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const requesterRole = getRequesterRole(req);
    if (!requesterRole || (requesterRole !== "Owner" && requesterRole !== "SuperAdmin")) {
      return res.status(403).json({ message: "Only Owner or SuperAdmin can update users" });
    }

    const { id } = req.params;
    const found = await User.findByPk(id);
    if (!found) return res.status(404).json({ message: "User not found" });

    const { username, email, password, role, customRoleName, modulePermissions } = req.body;
    const current = found as any;
    const targetRole = role ? normalizeRole(role) : (current.role as PlatformRole);
    if (!targetRole) return res.status(400).json({ message: "Invalid target role" });

    if (!canCreateRole(requesterRole, targetRole)) {
      return res.status(403).json({ message: `Role ${requesterRole} cannot update user to ${targetRole}` });
    }

    const requesterUserId = getRequesterUserId(req);
    if (!requesterUserId) {
      return res.status(400).json({ message: "requesterUserId is required" });
    }

    if (username && username !== current.username) {
      const taken = await User.findOne({ where: { username } });
      if (taken && (taken as any)._id !== current._id) {
        return res.status(400).json({ message: "Username already exists" });
      }
    }

    if (email && email !== current.email) {
      const taken = await User.findOne({ where: { email } });
      if (taken && (taken as any)._id !== current._id) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    const payload: any = {
      username: username ?? current.username,
      email: email ?? current.email,
      role: targetRole,
      customRoleName:
        targetRole === "Admin" && typeof customRoleName === "string" && customRoleName.trim()
          ? customRoleName.trim()
          : null,
      modulePermissions: targetRole === "Admin" ? sanitizePermissions(modulePermissions ?? current.modulePermissions) : {},
    };

    if (password) {
      payload.password = await bcrypt.hash(password, 10);
    }

    await found.update(payload);

    if (targetRole === "SuperAdmin" && Array.isArray(req.body?.pumpIds) && req.body.pumpIds.length > 0) {
      return res.status(400).json({
        message: "Assign SuperAdmin to pump only from SuperAdmin Management module",
      });
    }

    if (targetRole === "Admin" && Array.isArray(req.body?.pumpIds)) {
      const requestedPumpIds = req.body.pumpIds.filter((v: any) => typeof v === "string" && v.trim());
      const accessiblePumpIds = await getAccessiblePumpIdsForUser(requesterRole, requesterUserId);
      const allowedPumpIds = requestedPumpIds.filter((id: string) => accessiblePumpIds.includes(id));

      await PumpUserAccess.destroy({ where: { userId: current._id } });
      for (const pumpId of allowedPumpIds) {
        await PumpUserAccess.findOrCreate({
          where: { pumpId, userId: current._id },
          defaults: { grantedByUserId: requesterUserId },
        });
      }
    }

    await ActionLog.create({
      user: getRequesterName(req),
      role: requesterRole,
      action: `Updated user ${payload.username} (${targetRole})`,
    });

    const updatedObj = found.toJSON() as any;
    delete updatedObj.password;
    res.status(200).json(updatedObj);
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const requesterRole = getRequesterRole(req);
    if (!requesterRole || (requesterRole !== "Owner" && requesterRole !== "SuperAdmin")) {
      return res.status(403).json({ message: "Only Owner or SuperAdmin can view users" });
    }

    const where = requesterRole === "SuperAdmin" ? { role: "Admin" } : undefined;
    const users = (await User.findAll({
      where,
      order: [["createdAt", "DESC"]],
      attributes: { exclude: ["password"] },
    })) as any[];

    const userIds = users.map((u) => u._id);
    const mappings = userIds.length
      ? ((await PumpUserAccess.findAll({
          where: { userId: { [Op.in]: userIds } },
          attributes: ["userId", "pumpId"],
        })) as any[])
      : [];

    const pumpIdsByUser = new Map<string, string[]>();
    for (const mapRow of mappings) {
      if (!pumpIdsByUser.has(mapRow.userId)) pumpIdsByUser.set(mapRow.userId, []);
      pumpIdsByUser.get(mapRow.userId)!.push(mapRow.pumpId);
    }

    const enriched = users.map((u) => {
      const obj = u.toJSON();
      return { ...obj, pumpIds: pumpIdsByUser.get(u._id) || [] };
    });

    res.status(200).json(enriched);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const requesterRole = getRequesterRole(req);
    if (!requesterRole || (requesterRole !== "Owner" && requesterRole !== "SuperAdmin")) {
      return res.status(403).json({ message: "Only Owner or SuperAdmin can delete users" });
    }

    const { id } = req.params;
    const deletedUser = await User.findByPk(id);

    if (!deletedUser) return res.status(404).json({ message: "User not found" });

    const userObj = deletedUser as any;
    const targetRole = normalizeRole(userObj.role);
    if (!targetRole) return res.status(400).json({ message: "Invalid target user role" });
    if (!canCreateRole(requesterRole, targetRole)) {
      return res.status(403).json({ message: `Role ${requesterRole} cannot delete ${targetRole}` });
    }

    const username = userObj.username;

    if (targetRole === "SuperAdmin") {
      await PetrolPump.update(
        { primarySuperAdminUserId: null },
        { where: { primarySuperAdminUserId: userObj._id } }
      );
    }

    await PumpUserAccess.destroy({ where: { userId: userObj._id } });
    await deletedUser.destroy();

    await ActionLog.create({
      user: getRequesterName(req),
      role: requesterRole,
      action: `Deleted user ${username}`,
    });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};

export const getActionLogs = async (req: Request, res: Response) => {
  try {
    const requesterRole = getRequesterRole(req);
    if (!requesterRole || (requesterRole !== "Owner" && requesterRole !== "SuperAdmin")) {
      return res.status(403).json({ message: "Only Owner or SuperAdmin can view logs" });
    }

    const logs = await ActionLog.findAll({ order: [["createdAt", "DESC"]] });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching logs", error });
  }
};
