import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { esc, notifyAdmin, sendWelcomeEmail } from "../config/email.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, timezone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Faltan campos requeridos." });
    }
    const normalizedEmail = String(email).toLowerCase().trim();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(409).json({ message: "El correo ya está registrado." });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone?.trim() || "",
      timezone: timezone || "America/Mexico_City",
      isActive: true,
    });
    await Promise.all([
      sendWelcomeEmail(user.email, user.name),
      notifyAdmin({
        subject: `Nueva familia registrada: ${user.name}`,
        html: `<p><b>${esc(user.name)}</b> (${esc(user.email)}) creó su cuenta.</p>`,
        replyTo: user.email,
      }),
    ]);
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "8h" });
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "Tu cuenta está inactiva. Contacta al administrador." });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "8h" });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el login", error: error.message });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId).select("-password");
  res.json({ user });
});

export default router;
