// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db";

export const loginAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;

  const [rows]: any = await db.query(
    "SELECT * FROM admins WHERE email = ?",
    [email]
  );

  if (!rows.length) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const admin = rows[0];
  const valid = await bcrypt.compare(password, admin.password);

  if (!valid) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const token = jwt.sign(
    { id: admin.id, role: admin.role },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );

  res.cookie("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 1000,
  });

  res.json({ success: true });
};


export const logoutAdmin = (_: Request, res: Response) => {
  res.clearCookie("admin_token");
  res.json({ success: true });
};

export const getMe = (req: Request, res: Response) => {
  res.json(req.user);
};
