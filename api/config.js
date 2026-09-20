export default function handler(req, res) {
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
  if (req.method !== "GET") return res.status(405).json({ error: "GET required" });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !publishableKey) return res.status(503).json({ cloudEnabled: false });
  return res.status(200).json({ cloudEnabled: true, supabaseUrl: url, publishableKey });
}
