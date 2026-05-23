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
    ...fields,
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

export const chatLogger = {
  info: (event: string, fields?: LogFields) => write("info", event, fields),
  warn: (event: string, fields?: LogFields) => write("warn", event, fields),
  error: (event: string, fields?: LogFields) => write("error", event, fields),
};
