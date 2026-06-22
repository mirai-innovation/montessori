import Payment from "../models/Payment.js";

function monthStart(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function monthEnd(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export async function getRevenueSummary() {
  const now = new Date();
  const thisStart = monthStart(now);
  const thisEnd = monthEnd(now);
  const prevStart = monthStart(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const prevEnd = monthEnd(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  const [monthTotal, prevTotal] = await Promise.all([
    Payment.aggregate([
      { $match: { status: "completed", paidAt: { $gte: thisStart, $lte: thisEnd } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Payment.aggregate([
      { $match: { status: "completed", paidAt: { $gte: prevStart, $lte: prevEnd } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const monthRevenue = monthTotal[0]?.total || 0;
  const prevRevenue = prevTotal[0]?.total || 0;
  const growth = prevRevenue
    ? Math.round(((monthRevenue - prevRevenue) / prevRevenue) * 100)
    : monthRevenue > 0 ? 100 : 0;

  return { monthRevenue, monthGrowth: growth };
}

export async function getRevenueStats() {
  const now = new Date();
  const thisStart = monthStart(now);
  const thisEnd = monthEnd(now);
  const prevStart = monthStart(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const prevEnd = monthEnd(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const chartFrom = monthStart(new Date(now.getFullYear(), now.getMonth() - 5, 1));

  const [summary, pending, subscriptionCount, typeTotals, chartRows] = await Promise.all([
    getRevenueSummary(),
    Payment.aggregate([
      { $match: { status: "pending" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    Payment.distinct("userId", {
      type: "subscription",
      status: "completed",
      paidAt: { $gte: thisStart, $lte: thisEnd },
    }),
    Payment.aggregate([
      {
        $match: {
          status: "completed",
          paidAt: { $gte: thisStart, $lte: thisEnd },
        },
      },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]),
    Payment.aggregate([
      { $match: { status: "completed", paidAt: { $gte: chartFrom, $lte: thisEnd } } },
      {
        $group: {
          _id: {
            y: { $year: "$paidAt" },
            m: { $month: "$paidAt" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
    ]),
  ]);

  let oneTimeMonth = 0;
  let recurringMonth = 0;
  for (const row of typeTotals) {
    if (row._id === "subscription") recurringMonth = row.total;
    else oneTimeMonth += row.total;
  }

  return {
    monthRevenue: summary.monthRevenue,
    monthGrowth: summary.monthGrowth,
    mrr: recurringMonth,
    oneTimeMonth,
    pendingAmount: pending[0]?.total || 0,
    pendingCount: pending[0]?.count || 0,
    subscriptionCount: subscriptionCount.length,
    chart: buildChartFromRows(chartRows, 6),
  };
}

function buildChartFromRows(rows, months) {
  const labels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const now = new Date();
  const byMonth = new Map();
  for (const row of rows) {
    const key = `${row._id.y}-${row._id.m}`;
    if (!byMonth.has(key)) byMonth.set(key, { recurring: 0, oneTime: 0 });
    const bucket = byMonth.get(key);
    if (row._id.type === "subscription") bucket.recurring = row.total;
    else bucket.oneTime += row.total;
  }

  const result = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    const bucket = byMonth.get(key) || { recurring: 0, oneTime: 0 };
    result.push({
      label: labels[d.getMonth()],
      year: d.getFullYear(),
      recurring: bucket.recurring,
      oneTime: bucket.oneTime,
      total: bucket.recurring + bucket.oneTime,
    });
  }
  return result;
}

export function formatMxn(cents) {
  const pesos = (cents || 0) / 100;
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(pesos);
}

export function childAgeLabel(birthDate) {
  if (!birthDate) return "";
  const birth = new Date(birthDate);
  const now = new Date();
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (months < 24) return `${months}m`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem ? `${years}a ${rem}m` : `${years}a`;
}

export function daysSince(date) {
  if (!date) return null;
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
