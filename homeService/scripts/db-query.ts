import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env from the homeService folder
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runSql(sql: string) {
  try {
    // We use a database function 'exec_sql' if it exists. 
    // If not, we'll have to create it first.
    const { data, error } = await supabase.rpc('execute_sql', { query: sql });

    if (error) {
        // If execute_sql doesn't exist, we'll try to create it.
        if (error.message.includes('function "execute_sql" does not exist')) {
            console.log("Creating 'execute_sql' function...");
            // We can't create it via rpc if it doesn't exist.
            // This is a chicken-and-egg problem.
            // However, usually Supabase has 'postgres-meta' but it's not exposed via supabase-js easily.
            console.error("Please create the 'execute_sql' function in your Supabase SQL Editor:\n\n" +
                "CREATE OR REPLACE FUNCTION execute_sql(query text)\n" +
                "RETURNS jsonb\n" +
                "LANGUAGE plpgsql\n" +
                "SECURITY DEFINER\n" +
                "AS $$\n" +
                "DECLARE\n" +
                "  result jsonb;\n" +
                "BEGIN\n" +
                "  EXECUTE 'SELECT jsonb_agg(t) FROM (' || query || ') t' INTO result;\n" +
                "  RETURN result;\n" +
                "END;\n" +
                "$$;");
        } else {
            console.error("Query error:", error);
        }
    } else {
        console.log("Query result:", data);
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

async function inspectTable(tableName: string) {
    const { data, error } = await supabase.from(tableName).select('*').limit(1);
    if (error) console.error(`Error:`, error);
    else console.log(`Data from ${tableName}:`, data);
}

const action = process.argv[2];
const param = process.argv[3];

if (action === 'sql') {
    runSql(param);
} else if (action === 'inspect') {
    inspectTable(param);
} else {
    console.log("Usage: npx ts-node db-query.ts sql 'QUERY' or inspect <table_name>");
}
