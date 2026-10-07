export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ error: "GET required" });
  const review = Boolean(process.env.GEMINI_API_KEY);
  const cloud = Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
  return res.status(review ? 200 : 503).json({
    status: review ? (cloud ? "ok" : "partial") : "degraded",
    services: { processReview: review ? "configured" : "missing", journal: cloud ? "cloud" : "browser-local" },
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "local",
    timestamp: new Date().toISOString()
  });
}
