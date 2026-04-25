import { Client } from 'pg';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env from the homeService folder
dotenv.config({ path: '.env' });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("Missing DATABASE_URL in .env (Format: postgres://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres)");
  process.exit(1);
}

async function runMigration() {
  const client = new Client({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log("Connected to database successfully.");

    const sqlPath = path.resolve(process.cwd(), 'sql', 'update_package_services.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("Executing migration script...");
    await client.query(sql);
    console.log("Migration completed successfully!");

  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

runMigration();
