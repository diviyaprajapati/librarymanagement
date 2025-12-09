import mongoose from "mongoose";

// Function to auto generate unique ISBN when not provided
const generateISBN = () => {
  return "ISBN-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
};

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },

    isbn: {
      type: String,
      default: generateISBN
    },

    quantity: { type: Number, default: 1 },
    available: { type: Number, default: 1 },
    category: { type: String },
    description: { type: String },
    publishedYear: { type: Number }
  },
  { timestamps: true }
);

// Prevent OverwriteModelError on hot reload / dev
const Book = mongoose.models.Book || mongoose.model("Book", bookSchema);
export default Book;
