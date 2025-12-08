// backend/models/IssuedBook.js
import mongoose from "mongoose";

const IssuedBookSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  returnDate: { type: Date }, // ✅ store when book is returned
  status: {
    type: String,
    enum: ["pending", "approved", "collected", "rejected"],
    default: "pending",
  },
  returned: { type: Boolean, default: false },
  fine: { type: Number, default: 0 },
});

// ✅ Auto-set dueDate = issueDate + 15 days if not provided
IssuedBookSchema.pre("save", function (next) {
  if (!this.dueDate) {
    const issue = this.issueDate || new Date();
    this.dueDate = new Date(issue.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 days later
  }
  next();
});

// ✅ Prevent OverwriteModelError
const IssuedBook =
  mongoose.models.IssuedBook || mongoose.model("IssuedBook", IssuedBookSchema);

export default IssuedBook;
