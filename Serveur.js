// Point d'entrée pour Plesk Node.js
// Lance le serveur API (Express) qui sert aussi le frontend React en production
'use strict';

import('./artifacts/api-server/dist/index.mjs').catch(function (err) {
  console.error('Erreur au démarrage du serveur:', err);
  process.exit(1);
});
