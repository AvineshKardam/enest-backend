import "dotenv/config";
import mongoose from "mongoose";
import { Expense, EXPENSE_CATEGORIES } from "../src/models/Expense.js";

const MONGODB_URI = process.env.MONGODB_URI;

/** Sample amounts in INR (₹) */
const samples = [
  { title: "Weekly groceries", amount: 2850, category: "Food", daysAgo: 2 },
  { title: "Train tickets", amount: 420, category: "Travel", daysAgo: 5 },
  { title: "Coffee & pastry", amount: 180, category: "Food", daysAgo: 0 },
  { title: "Streaming subscription", amount: 499, category: "Entertainment", daysAgo: 8 },
  { title: "Pharmacy", amount: 640, category: "Health", daysAgo: 12 },
  { title: "Electric bill", amount: 3200, category: "Bills", daysAgo: 35 },
  { title: "New headphones", amount: 8999, category: "Shopping", daysAgo: 18 },
  { title: "Dinner out", amount: 1450, category: "Food", daysAgo: 45 },
  { title: "Taxi", amount: 350, category: "Travel", daysAgo: 3 },
  { title: "Misc supplies", amount: 275, category: "Other", daysAgo: 60 },
];

function dateDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(12, 0, 0, 0);
  return d;
}

async function run() {
  if (!MONGODB_URI) {
    console.error("Set MONGODB_URI in server/.env");
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URI);
  await Expense.deleteMany({});
  const docs = samples.map((s) => ({
    title: s.title,
    amount: s.amount,
    category: EXPENSE_CATEGORIES.includes(s.category) ? s.category : "Other",
    date: dateDaysAgo(s.daysAgo),
  }));
  await Expense.insertMany(docs);
  console.log(`Inserted ${docs.length} sample expenses`);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
