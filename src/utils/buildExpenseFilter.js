/**
 * Build a Mongoose filter from query params: category, dateFrom, dateTo, search
 */
export function buildExpenseFilter(query) {
  const filter = {};

  if (query.category && query.category !== "all") {
    filter.category = query.category;
  }

  if (query.dateFrom || query.dateTo) {
    filter.date = {};
    if (query.dateFrom) {
      const d = new Date(query.dateFrom);
      d.setHours(0, 0, 0, 0);
      filter.date.$gte = d;
    }
    if (query.dateTo) {
      const d = new Date(query.dateTo);
      d.setHours(23, 59, 59, 999);
      filter.date.$lte = d;
    }
  }

  if (query.search && String(query.search).trim()) {
    filter.title = { $regex: String(query.search).trim(), $options: "i" };
  }

  return filter;
}
