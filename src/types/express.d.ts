import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    pumpId?: string;
    requesterRole?: "Owner" | "SuperAdmin" | "Admin";
    requesterUserId?: string;
    requesterName?: string;
  }
}

