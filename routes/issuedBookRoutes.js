import express from "express";
import IssuedBook from "../models/IssuedBook.js";

const router = express.Router();

/**
 * GET all issued books
 * - If userId is given → only that user’s issued books
 * - Populates book & user details
 */
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;

    let query = {};
    if (userId) {
      query.user = userId;
    }

    const issuedBooks = await IssuedBook.find(query)
      .populate("user", "name email")
      .populate("book", "title author");

    res.json(issuedBooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /issue → Admin issues a book
 */
router.post("/issue", async (req, res) => {
  try {
    const { userId, bookId } = req.body;

    const issuedBook = new IssuedBook({
      user: userId,
      book: bookId,
      status: "approved", // 👈 enum me jo hai wahi use karo
    });

    await issuedBook.save();
    res.status(201).json(issuedBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /return/:id → User/Admin returns a book
 */
router.post("/return/:id", async (req, res) => {
  try {
    const issuedBook = await IssuedBook.findById(req.params.id);

    if (!issuedBook) {
      return res.status(404).json({ message: "Issued book not found" });
    }

    issuedBook.status = "returned";
    issuedBook.returned = true;
    issuedBook.returnDate = new Date();

    // Fine calculation
    if (issuedBook.dueDate < issuedBook.returnDate) {
      const daysLate = Math.ceil(
        (issuedBook.returnDate - issuedBook.dueDate) / (1000 * 60 * 60 * 24)
      );
      issuedBook.fine = daysLate * 10; // ₹10/day
    }

    await issuedBook.save();
    res.json(issuedBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
