// Point d'entrée pour Plesk / Phusion Passenger
'use strict';

// Log de démarrage immédiat pour faciliter le debug dans les logs Plesk
console.log('[Serveur.js] Démarrage... PORT=' + process.env.PORT + ' NODE_ENV=' + process.env.NODE_ENV);

if (!process.env.MYSQL_DATABASE_URL) {
  console.error('[FATAL] MYSQL_DATABASE_URL non défini. Ajoutez-le dans Plesk > Node.js > Custom environment variables.');
  process.exit(1);
}

import('./artifacts/api-server/dist/index.mjs').catch(function (err) {
  console.error('[FATAL] Erreur au démarrage du serveur:', err);
  process.exit(1);
});
