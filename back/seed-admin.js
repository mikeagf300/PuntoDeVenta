const db = require("./db");

async function run() {
  try {
    await db._init();
    console.log("DB initialized.");
    // The db init already seeds admin if missing using env vars
    console.log("If admin did not exist, it has been seeded.");
  } catch (err) {
    console.error("Failed to seed admin:", err);
    process.exit(1);
  }
}

run();
