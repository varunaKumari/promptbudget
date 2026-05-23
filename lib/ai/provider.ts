import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";

const DEFAULT_MODEL = "gpt-5.4-mini";
const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-20250514";
const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";

type ChatProvider = "openai" | "anthropic";

function getConfiguredProvider(): ChatProvider {
  const preferred = process.env.AI_CHAT_PROVIDER?.trim().toLowerCase();
  if (preferred === "anthropic") return "anthropic";
  if (preferred === "openai") return "openai";

  return process.env.OPENAI_API_KEY?.trim() ? "openai" : "anthropic";
}

export function getChatModelId(): string {
  const provider = getConfiguredProvider();

  if (provider === "anthropic") {
    return process.env.ANTHROPIC_CHAT_MODEL || DEFAULT_ANTHROPIC_MODEL;
  }

  return process.env.OPENAI_CHAT_MODEL || DEFAULT_MODEL;
}

export function assertAIConfigured() {
  const provider = getConfiguredProvider();
  const key =
    provider === "anthropic"
      ? process.env.ANTHROPIC_API_KEY?.trim()
      : process.env.OPENAI_API_KEY?.trim();

  if (!key) {
    throw new Error(
      provider === "anthropic"
        ? "ANTHROPIC_API_KEY is not configured"
        : "OPENAI_API_KEY is not configured"
    );
  }

  if (key.startsWith("NEXT_PUBLIC_")) {
    throw new Error("AI provider key must be server-only");
  }
}

export function getChatModel() {
  assertAIConfigured();
  const provider = getConfiguredProvider();

  if (provider === "anthropic") {
    const anthropic = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY?.trim(),
    });

    return anthropic(getChatModelId());
  }

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
