// scripts/postbuild.js
import { execSync } from "child_process";
const env = process.env.NEXT_ENVIRONMENT;

try {
  if (env !== "production") {
    console.log("🧪 Skipping migration generation (not production).");
    process.exit(0);
  }
  console.log(
    "🔧 Generating Drizzle migration files (no DB connection required)..."
  );

  execSync(
    "npx drizzle-kit generate --name='production-migrations' --out='./drizzle' --schema='./lib/db/schema.ts' --dialect=postgresql",
    { stdio: "inherit" }
  );

  console.log(
    "✅ Generated migration files. Actual DB migrate will run at app start."
  );
} catch (err) {
  console.error(
    "❌ Error generating migrations:",
    err && err.message ? err.message : err
  );
  process.exit(1);
}
