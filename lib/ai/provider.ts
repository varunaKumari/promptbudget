import { createOpenAI } from "@ai-sdk/openai";

const DEFAULT_MODEL = "gpt-5.4-mini";
const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";

export function getChatModelId(): string {
  return process.env.OPENAI_CHAT_MODEL || DEFAULT_MODEL;
}

export function assertAIConfigured() {
  const key = process.env.OPENAI_API_KEY?.trim();

  if (!key) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  if (key.startsWith("NEXT_PUBLIC_")) {
    throw new Error("OPENAI_API_KEY must be server-only");
  }
}

export function getChatModel() {
  assertAIConfigured();

  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY?.trim(),
  });

  return openai(getChatModelId());
}

export function getEmbeddingModelId(): string {
  return process.env.OPENAI_EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL;
}

export function getEmbeddingModel() {
  assertAIConfigured();

  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY?.trim(),
  });

  return openai.embedding(getEmbeddingModelId());
}
