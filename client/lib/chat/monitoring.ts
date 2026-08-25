import { chatLogger } from "./logging";
import { safeErrorMessage } from "./security";

interface MonitoringEvent {
  requestId: string;
  route: string;
  event: string;
  level: "info" | "warn" | "error";
  latencyMs?: number;
  metadata?: Record<string, unknown>;
  error?: unknown;
}

export function trackChatEvent(event: MonitoringEvent) {
  const payload = {
    requestId: event.requestId,
    route: event.route,
    latencyMs: event.latencyMs,
    ...event.metadata,
    error: event.error ? safeErrorMessage(event.error) : undefined,
  };

  if (event.level === "error") {
    chatLogger.error(event.event, payload);
    return;
  }

  if (event.level === "warn") {
    chatLogger.warn(event.event, payload);
    return;
  }

  chatLogger.info(event.event, payload);
}
