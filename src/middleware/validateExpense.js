import { body, validationResult } from "express-validator";
import { EXPENSE_CATEGORIES } from "../models/Expense.js";

export const expenseCreateRules = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 200 })
    .withMessage("Title must be at most 200 characters"),
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be greater than 0"),
  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn(EXPENSE_CATEGORIES)
    .withMessage("Invalid category"),
  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Date must be a valid ISO date"),
];

export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return res.status(400).json({
      message: "Validation failed",
      errors: messages,
    });
  }
  next();
}
