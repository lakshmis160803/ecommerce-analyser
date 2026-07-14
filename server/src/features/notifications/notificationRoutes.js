import express from "express";
import { addClient, removeClient } from "./notificationManager.js";
// This route MUST be protected, since req.user.id is what scopes each
// client's notification stream to the correct user.
import  protect  from "../../middleware/authMiddleware.js"; // fixed: was "../middleware/..."

const router = express.Router();

router.get("/stream", protect, (req, res) => {
  // Required SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  // If you're behind an nginx reverse proxy, this stops it from buffering
  // the stream (which would delay/batch your events):
  res.setHeader("X-Accel-Buffering", "no");

  res.flushHeaders?.();

  // Tell the client the connection is open (also helps some proxies/browsers
  // recognize the stream immediately instead of waiting for the first real event)
  res.write(`event: connected\ndata: ${JSON.stringify({ ok: true })}\n\n`);

  addClient(req.user.id, res);

  // Heartbeat: keeps the connection alive through proxies/load balancers
  // that kill idle connections (commonly after 30-60s of silence).
  const heartbeat = setInterval(() => {
    res.write(`: heartbeat\n\n`); // ":" prefix = SSE comment, ignored by EventSource
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    removeClient(req.user.id, res);
  });
});

export default router;