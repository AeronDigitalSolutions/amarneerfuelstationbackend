import { NextFunction, Request, Response } from "express";
import PetrolPump from "../models/petrolPumpModel";
import PumpUserAccess from "../models/pumpUserAccessModel";

const allowedRoles = new Set(["Owner", "SuperAdmin", "Admin"]);

const getRequesterContext = (req: Request) => {
  const requesterRoleRaw =
    (typeof req.headers["x-user-role"] === "string" && req.headers["x-user-role"]) ||
    (typeof req.query.userRole === "string" && req.query.userRole) ||
    (typeof req.body?.requesterRole === "string" && req.body.requesterRole) ||
    "";
  const requesterUserIdRaw =
    (typeof req.headers["x-user-id"] === "string" && req.headers["x-user-id"]) ||
    (typeof req.query.userId === "string" && req.query.userId) ||
    (typeof req.body?.requesterUserId === "string" && req.body.requesterUserId) ||
    "";
  const requesterNameRaw =
    (typeof req.headers["x-user-name"] === "string" && req.headers["x-user-name"]) ||
    (typeof req.body?.performedBy === "string" && req.body.performedBy) ||
    "";

  return {
    requesterRole: requesterRoleRaw.trim(),
    requesterUserId: requesterUserIdRaw.trim(),
    requesterName: requesterNameRaw.trim(),
  };
};

export const attachRequesterContext = (req: Request, _res: Response, next: NextFunction) => {
  const { requesterRole, requesterUserId, requesterName } = getRequesterContext(req);
  if (allowedRoles.has(requesterRole)) {
    req.requesterRole = requesterRole as "Owner" | "SuperAdmin" | "Admin";
  }
  if (requesterUserId) req.requesterUserId = requesterUserId;
  if (requesterName) req.requesterName = requesterName;
  next();
};

export const requirePumpContext = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { requesterRole, requesterUserId, requesterName } = getRequesterContext(req);
    if (!allowedRoles.has(requesterRole) || !requesterUserId) {
      return res.status(401).json({ message: "Missing requester context. Please login again." });
    }

    const pumpIdRaw =
      (typeof req.headers["x-pump-id"] === "string" && req.headers["x-pump-id"]) ||
      (typeof req.query.pumpId === "string" && req.query.pumpId) ||
      (typeof req.body?.pumpId === "string" && req.body.pumpId) ||
      "";
    const pumpId = pumpIdRaw.trim();

    if (!pumpId) {
      return res.status(400).json({ message: "Pump context is required. Select a petrol pump first." });
    }

    const pump = (await PetrolPump.findByPk(pumpId)) as any;
    if (!pump || !pump.isActive) {
      return res.status(404).json({ message: "Selected pump not found or inactive" });
    }

    if (requesterRole === "Owner") {
      if (pump.ownerUserId !== requesterUserId) {
        return res.status(403).json({ message: "Owner cannot access this pump" });
      }
    } else {
      const access = await PumpUserAccess.findOne({ where: { pumpId, userId: requesterUserId } });
      if (!access) {
        return res.status(403).json({ message: "You are not assigned to this pump" });
      }
    }

    req.pumpId = pumpId;
    req.requesterRole = requesterRole as "Owner" | "SuperAdmin" | "Admin";
    req.requesterUserId = requesterUserId;
    req.requesterName = requesterName || req.requesterName;
    return next();
  } catch (error) {
    console.error("Pump context validation error:", error);
    return res.status(500).json({ message: "Error validating pump context" });
  }
};

export const getPumpIdOrThrow = (req: Request): string => {
  if (!req.pumpId) throw new Error("Pump context missing");
  return req.pumpId;
};
