import { Router } from "express";
import { db } from "@workspace/db";
import { commandesTable } from "@workspace/db";
import { sql, gte, and } from "drizzle-orm";

const router = Router();

function getPeriodStart(period: string): Date {
  const now = new Date();
  switch (period) {
    case "24h": {
      const d = new Date(now);
      d.setHours(d.getHours() - 24);
      return d;
    }
    case "week": {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return d;
    }
    case "month": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 1);
      return d;
    }
    case "year": {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - 1);
      return d;
    }
    default: {
      const d = new Date(now);
      d.setHours(d.getHours() - 24);
      return d;
    }
  }
}

// Admin stats
router.get("/admin/stats", async (req, res) => {
  const period = (req.query.period as string) || "24h";
  const since = getPeriodStart(period);

  const rows = await db
    .select({
      statut: commandesTable.statut,
      count: sql<number>`count(*)::int`,
      total: sql<number>`coalesce(sum(${commandesTable.montant}), 0)::int`,
    })
    .from(commandesTable)
    .where(gte(commandesTable.createdAt, since))
    .groupBy(commandesTable.statut);

  let totalTransactions = 0;
  let totalCollected = 0;
  let totalFailed = 0;
  let totalSuccess = 0;
  let totalPending = 0;

  for (const row of rows) {
    totalTransactions += row.count;
    if (row.statut === "success" || row.statut === "SUCCESS") {
      totalSuccess += row.count;
      totalCollected += row.total;
    } else if (row.statut === "failed" || row.statut === "FAILED") {
      totalFailed += row.count;
    } else {
      totalPending += row.count;
    }
  }

  // Recent transactions
  const recent = await db
    .select({
      id: commandesTable.id,
      forfaitId: commandesTable.forfaitId,
      operateurForfait: commandesTable.operateurForfait,
      paymentOperator: commandesTable.paymentOperator,
      beneficiairePhone: commandesTable.beneficiairePhone,
      montant: commandesTable.montant,
      statut: commandesTable.statut,
      reference: commandesTable.reference,
      createdAt: commandesTable.createdAt,
    })
    .from(commandesTable)
    .where(gte(commandesTable.createdAt, since))
    .orderBy(sql`${commandesTable.createdAt} desc`)
    .limit(20);

  res.json({
    period,
    since: since.toISOString(),
    stats: {
      totalTransactions,
      totalSuccess,
      totalFailed,
      totalPending,
      totalCollected,
    },
    recent: recent.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  });
});

export default router;
