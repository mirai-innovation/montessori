import express from "express";
import Lead from "../models/Lead.js";
import { leadTypes } from "../../shared/content.js";
import { esc, notifyAdmin, sendGuideRequestedEmail } from "../config/email.js";

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clip = (v, n = 200) => String(v || "").trim().slice(0, n);

router.post("/", async (req, res) => {
  try {
    const { type, name, email, childAge, mainNeed } = req.body || {};
    if (!leadTypes.includes(type)) {
      return res.status(400).json({ message: "Tipo de registro no válido" });
    }
    if (!EMAIL_RE.test(String(email || "").trim())) {
      return res.status(400).json({ message: "Escribe un correo válido" });
    }
    if (type === "guide" && !clip(name)) {
      return res.status(400).json({ message: "Escribe tu nombre" });
    }
    // Un registro por correo y tipo: si ya existe, se actualizan los datos
    const result = await Lead.findOneAndUpdate(
      { type, email: clip(email).toLowerCase() },
      { name: clip(name), childAge: clip(childAge, 60), mainNeed: clip(mainNeed, 500) },
      { upsert: true, new: true, setDefaultsOnInsert: true, includeResultMetadata: true }
    );
    const lead = result.value;
    if (!result.lastErrorObject?.updatedExisting) {
      const label = type === "guide" ? "Guía gratuita" : "Escuela en Osaka";
      await Promise.all([
        type === "guide" ? sendGuideRequestedEmail(lead.email, lead.name) : null,
        notifyAdmin({
          subject: `${label}: nuevo registro${lead.name ? ` de ${lead.name}` : ""}`,
          html: `<p><b>${esc(lead.name || lead.email)}</b> (${esc(lead.email)}) se registró en <b>${label}</b>.</p>
            ${lead.childAge ? `<p>Edad del niño: ${esc(lead.childAge)}</p>` : ""}
            ${lead.mainNeed ? `<p>Principal dificultad: ${esc(lead.mainNeed)}</p>` : ""}
            ${type === "guide" ? "<p>Recuerda enviarle la guía respondiendo a este correo.</p>" : ""}`,
          replyTo: lead.email,
        }),
      ]);
    }
    res.status(201).json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "No se pudo guardar tu registro" });
  }
});

export default router;
