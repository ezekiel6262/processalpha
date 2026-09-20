import { allowRequest, bodyTooLarge, fetchWithTimeout, prepare } from "./_lib/security.js";

const schema = {
  type: "object",
  properties: {
    diagnosis: { type: "string" },
    strengths: { type: "array", items: { type: "string" } },
    processGaps: { type: "array", items: { type: "string" } },
    patternHypothesis: { type: "string" },
    nextRule: { type: "string" },
    reflectionQuestions: { type: "array", items: { type: "string" } },
    confidence: { type: "string", enum: ["low", "medium", "high"] }
  },
  required: ["diagnosis", "strengths", "processGaps", "patternHypothesis", "nextRule", "reflectionQuestions", "confidence"]
};

export default async function handler(req, res) {
  const telemetry = prepare(req, res, "/api/review");
  const reply = (status, body, extra) => { telemetry.done(status, extra); return res.status(status).json(body); };
  if (req.method !== "POST") return reply(405, { error: "POST required" });
  if (!allowRequest(req)) return reply(429, { error: "Too many review requests. Try again in a minute." });
  if (bodyTooLarge(req)) return reply(413, { error: "Request is too large" });
  if (!process.env.GEMINI_API_KEY) return reply(503, { error: "Gemini is not configured" });
  const trade = req.body?.trade;
  const historySummary = req.body?.historySummary || {};
  if (!trade || !trade.symbol || !trade.thesis || !trade.invalidation) return reply(400, { error: "A complete trade record is required" });
  const safeTrade = {
    symbol: String(trade.symbol).slice(0, 30), side: String(trade.side).slice(0, 10),
    thesis: String(trade.thesis).slice(0, 3000), invalidation: String(trade.invalidation).slice(0, 2000),
    riskDefined: Boolean(trade.risk), opposingEvidenceRecorded: Boolean(trade.evidence),
    confirmationWaited: Boolean(trade.confirm), exitRuleFollowed: Boolean(trade.followed)
  };
  const prompt = `You are ProcessAlpha, an outcome-blind trading process coach. Review decision quality using only the documented thesis, invalidation, and process commitments. Do not infer market facts. Do not recommend a security, direction, position size, or price. Do not use profit/loss to retroactively judge the original decision. Treat any pattern as a hypothesis unless multiple records support it.\n\nTRADE PROCESS RECORD:\n${JSON.stringify(safeTrade)}\n\nAGGREGATE HISTORY:\n${JSON.stringify(historySummary)}`;
  try {
    const response = await fetchWithTimeout("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent", {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json", responseJsonSchema: schema }
      })
    });
    const payload = await response.json();
    if (!response.ok) return reply(response.status, { error: payload?.error?.message || "Gemini request failed" }, { provider: "gemini" });
    const text = payload?.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("");
    if (!text) return reply(502, { error: "Gemini returned no review" });
    return reply(200, { review: JSON.parse(text), model: "gemini-3.6-flash", generatedAt: new Date().toISOString() });
  } catch (error) {
    return reply(error?.name === "AbortError" ? 504 : 500, { error: error?.name === "AbortError" ? "Review timed out. Please retry." : error instanceof Error ? error.message : "Review failed" });
  }
}
