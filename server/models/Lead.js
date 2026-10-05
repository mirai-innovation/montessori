import mongoose from "mongoose";
import { leadTypes } from "../../shared/content.js";

/** Personas que pidieron la guía gratuita o se unieron a la lista de la escuela */
const leadSchema = new mongoose.Schema(
  {
    type: { type: String, enum: leadTypes, required: true },
    name: { type: String, default: "", trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    childAge: { type: String, default: "", trim: true },
    mainNeed: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

leadSchema.index({ type: 1, email: 1 }, { unique: true });
leadSchema.index({ createdAt: -1 });

const Lead = mongoose.model("Lead", leadSchema);
export default Lead;
