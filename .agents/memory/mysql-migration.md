---
name: MySQL migration
description: Migration complète de PostgreSQL vers MySQL (Plesk/Cybrancee) — décisions et incompatibilités
---

## Règle principale
Ce projet utilise **MySQL** (Plesk Cybrancee, `MYSQL_DATABASE_URL`). Ne plus utiliser `DATABASE_URL` / `drizzle-orm/node-postgres` / `pg`.

## Incompatibilités PostgreSQL → MySQL résolues

### 1. `.returning()` après INSERT
MySQL ne supporte pas `.returning()` avec Drizzle.
**Solution :** INSERT → lire `result[0].insertId` → SELECT par id.

### 2. Casts PostgreSQL (`::int`)
`count(*)::int` et `coalesce(sum(...), 0)::int` sont invalides en MySQL.
**Solution :** `CAST(count(*) AS SIGNED)` et `CAST(coalesce(sum(...), 0) AS SIGNED)`.

### 3. Driver et schéma Drizzle
- `drizzle-orm/node-postgres` + `pg` → `drizzle-orm/mysql2` + `mysql2`
- `pgTable`, `serial`, `timestamp` (pg-core) → `mysqlTable`, `int().autoincrement()`, `timestamp({ mode: 'date' })` (mysql-core)
- `dialect: "postgresql"` → `dialect: "mysql"` dans drizzle.config.ts

## mysql2 doit être dans api-server/package.json
esbuild externalise mysql2 (ligne 82 de build.mjs), donc mysql2 doit être listé dans les dépendances de `@workspace/api-server` en plus de `@workspace/db`, sinon Node ne le trouve pas au runtime.

**Why:** Le bundle ESM externalise mysql2 (modules natifs), donc Node.js résout mysql2 à l'exécution depuis les node_modules du package qui lance le process (api-server), pas depuis lib/db.

## Données migrées
1 ligne test dans `commandes` (id=1, statut=failed, montant=3100 XAF, 2026-08-17).
