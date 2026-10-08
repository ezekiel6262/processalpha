import { allowRequest, fetchWithTimeout, prepare } from "./_lib/security.js";

const INTERVALS = new Set(["1m", "5m", "15m", "1H", "4H", "1D"]);

export default async function handler(req, res) {
  const telemetry = prepare(req, res, "/api/candles");
  const reply = (status, body, extra) => { telemetry.done(status, extra); return res.status(status).json(body); };
  if (req.method !== "GET") return reply(405, { error: "GET required" });
  if (!allowRequest(req, 30)) return reply(429, { error: "Too many chart requests" });
  const symbol = String(req.query?.symbol || "").trim().toUpperCase();
  const interval = String(req.query?.interval || "15m");
  if (!/^[A-Z0-9]{3,30}$/.test(symbol)) return reply(400, { error: "A valid symbol is required" });
  if (!INTERVALS.has(interval)) return reply(400, { error: "Unsupported chart interval" });
  try {
    const url = "https://api.bitget.com/api/v3/market/candles?category=SPOT&symbol=" + encodeURIComponent(symbol) + "&interval=" + encodeURIComponent(interval) + "&type=market&limit=96";
    const response = await fetchWithTimeout(url, { headers: { accept: "application/json" } }, 8000);
    const payload = await response.json();
    if (!response.ok || payload?.code !== "00000" || !Array.isArray(payload.data)) return reply(502, { error: "Chart data is temporarily unavailable" }, { providerStatus: response.status });
    const candles = payload.data.map(row => ({ time: Number(row[0]), open: Number(row[1]), high: Number(row[2]), low: Number(row[3]), close: Number(row[4]), volume: Number(row[5]) })).filter(candle => Object.values(candle).every(Number.isFinite)).sort((a, b) => a.time - b.time);
    return reply(200, { symbol, interval, source: "Bitget", candles });
  } catch (error) {
    return reply(error?.name === "AbortError" ? 504 : 502, { error: "Chart data is temporarily unavailable" });
  }
}
