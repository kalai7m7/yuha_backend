// src/routes/auth.routes.ts
import { Router } from "express";
import {
  logoutAdmin,
  getMe,
  loginAdmin,
} from "../controllers/auth.controller";
import { requireAdmin } from "../middlewares/auth.middleware";

const authRouter = Router();

authRouter.post("/login", loginAdmin);
authRouter.post("/logout", logoutAdmin);
authRouter.get("/admin/me", requireAdmin, getMe);

export default authRouter;
