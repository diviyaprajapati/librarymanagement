import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import bookRoutes from "./routes/bookRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import issuedBookRoutes from "./routes/issuedBookRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
// ✅ Database connection
import connectDB from "./config/db.js";

// Connect to MongoDB




dotenv.config();
connectDB();
const app = express();

app.use(cors({
  origin: "http://localhost:2000",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// ✅ Routes mount
app.use("/api/books", bookRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/issued", issuedBookRoutes);
app.use("/api/request-book", requestRoutes);
app.use("/api/public", statsRoutes);

app.get("/", (req, res) => {
  res.send("Library Management System API is running...");
});


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
