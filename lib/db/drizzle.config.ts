import { defineConfig } from "drizzle-kit";
import path from "path";

if (!process.env.MYSQL_DATABASE_URL) {
  throw new Error("MYSQL_DATABASE_URL must be set");
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "mysql",
  dbCredentials: {
    url: process.env.MYSQL_DATABASE_URL,
  },
});
