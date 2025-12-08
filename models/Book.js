// backend/models/Book.js
import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    isbn: { type: String, unique: true },
    quantity: { type: Number, default: 1 }, // ✅ total stock
    available: { type: Number, default: 1 }, // ✅ currently available
    category: { type: String },
    description: { type: String },
    publishedYear: { type: Number },
  },
  { timestamps: true }
);

// Prevent OverwriteModelError in dev/watch mode
const Book = mongoose.models.Book || mongoose.model("Book", bookSchema);
export default Book;
