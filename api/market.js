import { allowRequest, fetchWithTimeout, prepare } from "./_lib/security.js";

export default async function handler(req, res) {
  const telemetry = prepare(req, res, "/api/market");
  const reply = (status, body, extra) => { telemetry.done(status, extra); return res.status(status).json(body); };
  if (req.method !== "GET") return reply(405, { error: "GET required" });
  if (!allowRequest(req, 30)) return reply(429, { error: "Too many market requests" });
  const symbol = String(req.query?.symbol || "").trim().toUpperCase();
  if (!/^[A-Z0-9]{3,30}$/.test(symbol)) return reply(400, { error: "A valid symbol is required" });
  try {
    const response = await fetchWithTimeout(`https://api.bitget.com/api/v2/spot/market/tickers?symbol=${encodeURIComponent(symbol)}`, { headers: { accept: "application/json" } }, 8000);
    const payload = await response.json();
    const ticker = payload?.data?.[0];
    if (!response.ok || payload?.code !== "00000" || !ticker) return reply(502, { error: "Market validation is temporarily unavailable" }, { providerStatus: response.status });
    return reply(200, { symbol: ticker.symbol, lastPrice: Number(ticker.lastPr), bid: Number(ticker.bidPr), ask: Number(ticker.askPr), timestamp: Number(ticker.ts), source: "Bitget" });
  } catch (error) {
    return reply(error?.name === "AbortError" ? 504 : 502, { error: "Market validation is temporarily unavailable" });
  }
}
