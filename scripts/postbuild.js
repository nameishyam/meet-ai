import { execSync } from "child_process";

try {
  const env = process.env.NEXT_ENVIRONMENT;

  if (env === "production") {
    console.log("🚀 Running Drizzle migration for production...");
    execSync(
      "npx drizzle-kit generate --name='production-migrations' --out='./drizzle/migrations'",
      {
        stdio: "inherit",
      }
    );

    execSync("npx drizzle-kit migrate", { stdio: "inherit" });

    console.log("✅ Drizzle migrations completed.");
  } else {
    console.log(
      "🧪 Skipping migration (NEXT_ENVIRONMENT not production). Current value:",
      env
    );
  }
} catch (err) {
  console.error("❌ Error while running postbuild migrations:", err);
  process.exit(1);
}
