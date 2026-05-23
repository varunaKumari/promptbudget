import { createOpenAI } from "@ai-sdk/openai";

const DEFAULT_MODEL = "gpt-5.4-mini";

export function getChatModelId(): string {
  return process.env.OPENAI_CHAT_MODEL || DEFAULT_MODEL;
}

export function assertAIConfigured() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
}

export function getChatModel() {
  assertAIConfigured();

  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return openai(getChatModelId());
}
