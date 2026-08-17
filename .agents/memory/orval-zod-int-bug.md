---
name: Orval zod.int() bug
description: Orval v8 génère zod.int() pour les types number dans OpenAPI 3.1 — invalide en zod v3. Patch requis après codegen.
---

## Règle

Après chaque `pnpm --filter @workspace/api-spec run codegen`, patcher le fichier généré :

```bash
sed -i 's/zod\.int()/zod.number()/g' lib/api-zod/src/generated/api.ts
pnpm run typecheck:libs
```

**Why:** Orval v8.23 génère `zod.int()` pour les champs `type: integer` (et parfois `type: number` nullable) en OpenAPI 3.1. Cette méthode n'existe pas sur le namespace `zod` dans zod v3 — elle n'est disponible que dans zod v4 beta. La correction est de remplacer par `zod.number()`.

**How to apply:** Lancer le sed après chaque `codegen` avant de vérifier les types. La codegen script chain (`pnpm run codegen`) échoue car elle appelle `typecheck:libs` automatiquement — mieux vaut exécuter `orval` directement puis patcher :
```bash
cd lib/api-spec && pnpm exec orval --config ./orval.config.ts
sed -i 's/zod\.int()/zod.number()/g' ../../lib/api-zod/src/generated/api.ts
cd ../.. && pnpm run typecheck:libs
```
