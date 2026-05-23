type LogLevel = "info" | "warn" | "error";

interface LogFields {
  requestId?: string;
  conversationId?: string;
  auditId?: string;
  [key: string]: unknown;
}

function write(level: LogLevel, event: string, fields: LogFields = {}) {
  const payload = {
    event,
    ...sanitizeFields(fields),
  };

  if (level === "error") {
    console.error("[chat]", payload);
    return;
  }

  if (level === "warn") {
    console.warn("[chat]", payload);
    return;
  }

  console.info("[chat]", payload);
}

function sanitizeFields(fields: LogFields): LogFields {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [
      key,
      typeof value === "string"
        ? value.replace(/(sk-[a-zA-Z0-9_-]{8,})/g, "sk-***")
        : value,
    ])
  );
}

export const chatLogger = {
  info: (event: string, fields?: LogFields) => write("info", event, fields),
  warn: (event: string, fields?: LogFields) => write("warn", event, fields),
  error: (event: string, fields?: LogFields) => write("error", event, fields),
};
