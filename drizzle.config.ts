import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config(); // ✅ Charge les variables du fichier .env

if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is missing. Vérifie ton fichier .env.");
}

export default defineConfig({
  schema: "./shared/schema.ts",   // 🧠 Adapte ce chemin si nécessaire
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
