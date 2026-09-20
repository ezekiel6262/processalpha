import fs from "node:fs";
import postgres from "postgres";

const env = Object.fromEntries(fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(line => line && !line.startsWith("#") && line.includes("=")).map(line => {
  const index = line.indexOf("=");
  return [line.slice(0, index), line.slice(index + 1).replace(/^"|"$/g, "")];
}));
const url = env.POSTGRES_URL_NON_POOLING || env.POSTGRES_URL;
if (!url) throw new Error("POSTGRES_URL_NON_POOLING is missing from .env.local");
const sql = postgres(url, { max: 1, ssl: "require" });
try {
  const migration = fs.readFileSync("supabase/migrations/20260920010000_create_trades.sql", "utf8");
  await sql.unsafe(migration);
  const [result] = await sql`select relrowsecurity as rls from pg_class where oid = 'public.trades'::regclass`;
  if (!result?.rls) throw new Error("Verification failed: RLS is not enabled");
  const policies = await sql`select policyname from pg_policies where schemaname = 'public' and tablename = 'trades'`;
  if (policies.length !== 4) throw new Error(`Verification failed: expected 4 RLS policies, found ${policies.length}`);
  const [anonGrant] = await sql`select has_table_privilege('anon', 'public.trades', 'select,insert,update,delete') as exposed`;
  if (anonGrant?.exposed) throw new Error("Verification failed: anon has table privileges");
  console.log("Migration applied; RLS, ownership policies, and anonymous-access denial verified.");
} finally {
  await sql.end();
}
