import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function initDatabase() {
  const host = process.env.DB_HOST || "localhost";
  const port = parseInt(process.env.DB_PORT || "3306", 10);
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";
  const database = process.env.DB_NAME || "pragya_ai";

  console.log(`[Init DB] Connecting to MySQL server at ${host}:${port} as ${user}...`);

  try {
    // 1. Connect without specific database to create it
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true,
    });

    console.log(`[Init DB] Connected. Creating database '${database}' if it does not exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);

    // 2. Read schema.sql
    const schemaPath = path.resolve(__dirname, "../../schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf-8");

    console.log(`[Init DB] Executing schema.sql on database '${database}'...`);
    await connection.query(`USE \`${database}\`;`);
    await connection.query(schemaSql);

    console.log("[Init DB] Schema & database tables successfully created!");
    console.log("---------------------------------------------------------");
    console.log("Created tables:");
    console.log("  - users (id, username, email, password_hash, full_name, role, status, ...)");
    console.log("  - auth_sessions (id, user_id, token_hash, ip_address, expires_at, ...)");
    console.log("  - airgap_api_keys (id, user_id, key_name, key_prefix, ...)");
    console.log("  - audit_logs (id, user_id, action, resource, details, ...)");
    console.log("  - knowledge_documents (id, title, category, unit, content, ...)");
    console.log("  - document_embeddings (id, document_id, vector_dimensions, embedding_vector JSON, ...)");
    console.log("---------------------------------------------------------");

    await connection.end();
  } catch (error: any) {
    console.error("[Init DB Error] Failed to initialize MySQL database:", error.message);
    console.log("\nNote: Make sure MySQL server is running locally on port 3306 or update your credentials in backend/.env");
  }
}

initDatabase();
