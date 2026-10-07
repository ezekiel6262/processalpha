import { allowRequest, bodyTooLarge, prepare } from "./_lib/security.js";

const allowedEvents = new Set(["workspace_opened", "view_changed", "trade_saved", "trade_deleted", "rule_added", "client_error"]);

export default function handler(req, res) {
  const telemetry = prepare(req, res, "/api/event");
  const reply = status => { telemetry.done(status); return res.status(status).end(); };
  if (req.method !== "POST") return reply(405);
  if (!allowRequest(req, 60)) return reply(429);
  if (bodyTooLarge(req, 4096)) return reply(413);
  const event = String(req.body?.event || "");
  if (!allowedEvents.has(event)) return reply(400);
  const view = ["journal", "patterns", "rulebook"].includes(req.body?.view) ? req.body.view : undefined;
  console.log(JSON.stringify({ level: event === "client_error" ? "error" : "info", msg: "product_event", event, view, release: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "local" }));
  return reply(204);
}
