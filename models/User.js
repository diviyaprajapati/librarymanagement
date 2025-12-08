// backend/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    lastLogin: { type: Date }, // ✅ Track last login
  },
  { timestamps: true } // createdAt/updatedAt
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
