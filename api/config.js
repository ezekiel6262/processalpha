import { fetchWithTimeout } from "./_lib/security.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
  if (req.method !== "GET") return res.status(405).json({ error: "GET required" });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !publishableKey) return res.status(200).json({ cloudEnabled: false });
  try {
    const health = await fetchWithTimeout(`${url}/auth/v1/health`, { headers: { apikey: publishableKey } }, 4000);
    if (!health.ok) return res.status(200).json({ cloudEnabled: false });
    return res.status(200).json({ cloudEnabled: true, supabaseUrl: url, publishableKey });
  } catch {
    return res.status(200).json({ cloudEnabled: false });
  }
}
