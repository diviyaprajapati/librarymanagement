import Book from "../models/Book.js";
import User from "../models/User.js";

export const getPublicStats = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments();
    
    // ✅ Total Books = SUM of all book quantities
    const books = await Book.aggregate([
      { $group: { _id: null, totalQuantity: { $sum: "$quantity" } } }
    ]);
    const totalBooks = books.length > 0 ? books[0].totalQuantity : 0;

    // ✅ Active customers (filter by active field if available)
    const activeCustomers = await User.countDocuments({ isActive: true });

    res.json({
      totalCustomers,
      totalBooks,   // 👈 ab yaha "quantity ka sum" aa jayega
      activeCustomers,
    });
  } catch (err) {
    console.error("Error in public stats:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
