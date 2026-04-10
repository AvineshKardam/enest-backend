import { Router } from "express";
import mongoose from "mongoose";
import { Expense } from "../models/Expense.js";
import { buildExpenseFilter } from "../utils/buildExpenseFilter.js";
import {
  expenseCreateRules,
  handleValidationErrors,
} from "../middleware/validateExpense.js";

const router = Router();

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** GET /api/expenses/summary/monthly — must be before /:id */
router.get("/summary/monthly", async (req, res) => {
  try {
    const match = buildExpenseFilter(req.query);
    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ];
    const rows = await Expense.aggregate(pipeline);
    const months = rows.map((r) => {
      const m = r._id.month - 1;
      return {
        year: r._id.year,
        month: r._id.month,
        label: `${MONTH_NAMES[m]} ${r._id.year}`,
        key: `${r._id.year}-${String(r._id.month).padStart(2, "0")}`,
        total: Math.round(r.total * 100) / 100,
        count: r.count,
      };
    });
    res.json({ months });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load monthly summary" });
  }
});

/** GET /api/expenses */
router.get("/", async (req, res) => {
  try {
    const filter = buildExpenseFilter(req.query);
    const expenses = await Expense.find(filter).sort({ date: -1, createdAt: -1 }).lean();
    const formatted = expenses.map((e) => ({
      ...e,
      _id: String(e._id),
      date: e.date.toISOString(),
      createdAt: e.createdAt?.toISOString(),
      updatedAt: e.updatedAt?.toISOString(),
    }));
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
});

/** POST /api/expenses */
router.post(
  "/",
  expenseCreateRules,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { title, amount, category, date } = req.body;
      const doc = await Expense.create({
        title,
        amount: Number(amount),
        category,
        date: new Date(date),
      });
      const e = doc.toObject();
      res.status(201).json({
        ...e,
        _id: String(e._id),
        date: e.date.toISOString(),
        createdAt: e.createdAt?.toISOString(),
        updatedAt: e.updatedAt?.toISOString(),
      });
    } catch (err) {
      if (err instanceof mongoose.Error.ValidationError) {
        const messages = Object.values(err.errors).map((x) => x.message);
        return res.status(400).json({ message: "Validation failed", errors: messages });
      }
      console.error(err);
      res.status(500).json({ message: "Failed to create expense" });
    }
  },
);

/** DELETE /api/expenses/:id */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid expense id" });
    }
    const deleted = await Expense.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.json({ message: "Deleted", id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete expense" });
  }
});

export default router;
