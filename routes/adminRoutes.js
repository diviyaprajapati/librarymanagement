// backend/routes/adminRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Book from "../models/Book.js"; // Book model

const router = express.Router();

// ✅ Admin-only dashboard stats
router.get("/dashboard-stats", protect(["admin"]), async (req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30); // last 30 days

    const userFilter = { role: "user" };

    // Total customers
    const totalCustomers = await User.countDocuments(userFilter);

    // Active customers (last 30 days login)
    const activeCustomers = await User.countDocuments({
      ...userFilter,
      lastLogin: { $gte: since },
    });

    // Total books quantity
    const books = await Book.find();
    const totalBooks = books.reduce((sum, book) => sum + (book.quantity || 0), 0);

    res.json({
      totalCustomers,
      totalBooks,       // Total quantity of all books
      activeCustomers,
    });
  } catch (e) {
    res.status(500).json({ message: "Error fetching stats", error: e.message });
  }
});

export default router;
