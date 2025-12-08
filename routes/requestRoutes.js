import express from "express";
import IssuedBook from "../models/IssuedBook.js";
import Book from "../models/Book.js";

const router = express.Router();

// ✅ User: Create a new book request
router.post("/", async (req, res) => {
  try {
    const { userId, bookId } = req.body;

    if (!userId || !bookId) {
      return res.status(400).json({ message: "userId & bookId required" });
    }

    const newRequest = new IssuedBook({
      user: userId,
      book: bookId,
      issueDate: new Date(),
      status: "pending",
      returned: false,
      fine: 0
    });

    await newRequest.save();
    res.status(201).json({ message: "Book request created ✅", request: newRequest });
  } catch (err) {
    console.error("❌ Error in /request-book POST:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Admin: Get all book requests
router.get("/", async (req, res) => {
  try {
    const requests = await IssuedBook.find()
      .populate("user", "name email")
      .populate("book", "title author category");
    res.status(200).json(requests);
  } catch (err) {
    console.error("❌ Error in /request-book GET:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Admin: Provide book to user
router.post("/provide/:id", async (req, res) => {
  try {
    const requestId = req.params.id;

    const request = await IssuedBook.findById(requestId).populate("book");
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.status === "approved")
      return res.status(400).json({ message: "Book already provided" });

    const book = await Book.findById(request.book._id);
    if (!book || book.quantity <= 0)
      return res.status(400).json({ message: "Book out of stock" });

    // Update IssuedBook status
    request.status = "approved"; // issued
    request.issueDate = new Date();
    request.returned = false;
    await request.save();

    // Reduce book quantity
    book.quantity -= 1;
    await book.save();

    res.status(200).json({ message: "Book provided successfully ✅", request });
  } catch (err) {
    console.error("❌ Error in /request-book/provide POST:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Admin: Collect/Return book from user
router.post("/collect/:id", async (req, res) => {
  try {
    const requestId = req.params.id;

    const request = await IssuedBook.findById(requestId).populate("book");
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.returned)
      return res.status(400).json({ message: "Book already collected" });

    // Calculate overdue fine (assuming dueDate = issueDate + 7 days)
    const issueDate = new Date(request.issueDate);
    const dueDate = request.dueDate || new Date(issueDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const today = new Date();
    const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
    const fine = daysOverdue > 0 ? daysOverdue * 10 : 0;

    // Update book quantity
    const book = await Book.findById(request.book._id);
    if (book) {
      book.quantity += 1;
      await book.save();
    }

    // Update IssuedBook status
    request.status = "collected";
    request.returned = true;
    request.returnDate = today;
    request.fine = fine;
    await request.save();

    res.status(200).json({ message: `Book collected successfully ✅ Fine: ₹${fine}`, request });
  } catch (err) {
    console.error("❌ Error in /request-book/collect POST:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
