import { neon } from '@neondatabase/serverless';
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
try {
  const sql = neon(process.env.DATABASE_URL);
  const tables = await sql.query(`SELECT table_schema,table_name FROM information_schema.tables
    WHERE table_schema NOT IN ('pg_catalog','information_schema') ORDER BY table_schema,table_name`, []);
  const plans = await sql.query(`SELECT id,price_cents,period_days,
    credits/standard_cost AS standard_letters,credits/premium_cost AS premium_letters,
    credits/research_cost AS research_reports FROM billing.plans ORDER BY price_cents`, []);
  const functions = await sql.query("SELECT routine_name FROM information_schema.routines WHERE routine_schema='billing'", []);
  console.log(JSON.stringify({ connected: true, tables, plans, functions }));
} catch (error) {
  console.error(JSON.stringify({ connected: false, code: error.code || 'CONNECTION_FAILED' }));
  process.exitCode = 1;
}
