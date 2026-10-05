import mongoose from "mongoose";
import { servicePlans } from "../../shared/content.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    timezone: { type: String, default: "America/Mexico_City" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isActive: { type: Boolean, default: true },
    adminNotes: { type: String, default: "" },
    sessionCredits: { type: Number, default: 0 },
    activePlan: {
      type: String,
      enum: ["none", "single", "pack4", "accompany", "membership", ...servicePlans.map((p) => p.id)],
      default: "none",
    },
    planRenewsAt: { type: Date },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
