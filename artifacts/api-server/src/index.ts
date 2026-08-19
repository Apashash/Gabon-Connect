import app from "./app";
import { logger } from "./lib/logger";

// Passenger/Plesk fournit PORT — fallback 3000 si absent
const rawPort = process.env["PORT"];
const port = rawPort ? Number(rawPort) : 3000;

if (Number.isNaN(port) || port <= 0) {
  console.error(`[FATAL] PORT invalide: "${rawPort}"`);
  process.exit(1);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
});
