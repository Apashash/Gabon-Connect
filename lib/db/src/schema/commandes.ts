import { mysqlTable, int, text, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const commandesTable = mysqlTable("commandes", {
  id: int("id").primaryKey().autoincrement(),
  forfaitId: text("forfait_id").notNull(),
  operateurForfait: text("operateur_forfait").notNull(), // "moov" | "airtel"
  beneficiairePhone: text("beneficiaire_phone").notNull(),
  paymentOperator: text("payment_operator").notNull(), // "Airtel Money" | "Moov Money"
  paymentPhone: text("payment_phone").notNull(),
  transactionId: text("transaction_id"),
  reference: text("reference"),
  statut: text("statut").notNull().default("pending"), // "pending" | "success" | "failed" | "otp_required"
  montant: int("montant").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const insertCommandeSchema = createInsertSchema(commandesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCommande = z.infer<typeof insertCommandeSchema>;
export type Commande = typeof commandesTable.$inferSelect;
