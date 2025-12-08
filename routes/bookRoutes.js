// backend/routes/bookRoutes.js
import express from "express";
import Book from "../models/Book.js";
import IssuedBook from "../models/IssuedBook.js";

const router = express.Router();

/* ----------------- 📚 BOOK CRUD ----------------- */

// ➕ Add a book
router.post("/", async (req, res) => {
  try {
    const newBook = new Book(req.body);
    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📖 Get all books
router.get("/", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔍 Get single book
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✏️ Update book
router.put("/:id", async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedBook) return res.status(404).json({ message: "Book not found" });
    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ❌ Delete book
router.delete("/:id", async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) return res.status(404).json({ message: "Book not found" });
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ----------------- 📖 ISSUE / RETURN ----------------- */

// 📌 Issue a book
router.post("/:id/issue", async (req, res) => {
  try {
    const { userId, dueDate } = req.body;
    const book = await Book.findById(req.params.id);

    if (!book) return res.status(404).json({ message: "Book not found" });
    if (book.quantity <= 0)
      return res.status(400).json({ message: "Book out of stock" });

    // Update book quantity
    book.quantity -= 1;
    if (book.quantity === 0) book.available = false;
    await book.save();

    // Save issued book record
    const issued = new IssuedBook({
      user: userId,
      book: book._id,
      dueDate: dueDate || undefined,
      returned: false,
    });
    await issued.save();

    res.status(201).json({ message: "Book issued successfully", issued });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Get all issued books (Admin)
router.get("/issued/all", async (req, res) => {
  try {
    const issuedBooks = await IssuedBook.find()
      .populate("user", "name email")
      .populate("book", "title author category");
    res.json(issuedBooks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Get issued books of a single user
router.get("/issued/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const issuedBooks = await IssuedBook.find({ user: userId, returned: false })
      .populate("book", "title author category");
    res.json(issuedBooks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Return a book
router.patch("/issued/:id/return", async (req, res) => {
  try {
    const issued = await IssuedBook.findById(req.params.id);
    if (!issued) return res.status(404).json({ message: "Issued record not found" });

    issued.returned = true;

    // Fine calculation
    const today = new Date();
    if (today > issued.dueDate) {
      const daysLate = Math.ceil((today - issued.dueDate) / (1000 * 60 * 60 * 24));
      issued.fine = daysLate * 10;
    }
    await issued.save();

    // Update book quantity
    const book = await Book.findById(issued.book);
    if (book) {
      book.quantity += 1;
      book.available = true;
      await book.save();
    }

    res.json({ message: "Book returned successfully", issued });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ----------------- ⏰ DUE BOOKS ----------------- */

// 📌 Get due books (not returned + past dueDate)
router.get("/due", async (req, res) => {
  try {
    const today = new Date();
    const dueBooks = await IssuedBook.find({
      returned: false,
      dueDate: { $lt: today },
    })
      .populate("user", "name email")
      .populate("book", "title author category");

    res.json(dueBooks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ----------------- ✅ EXPORT ----------------- */
export default router;
 