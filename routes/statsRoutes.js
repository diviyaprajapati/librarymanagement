import express from "express";
import { getPublicStats } from "../controllers/statsController.js";

const router = express.Router();

router.get("/stats", getPublicStats); // 👈 public stats route

export default router;
