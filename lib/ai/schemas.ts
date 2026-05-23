import { z } from "zod";
import {
  assertAttachmentSafe,
  sanitizeText,
} from "@/lib/chat/security";

const uuidSchema = z.string().uuid();

export const chatAttachmentSchema = z.object({
  id: z.string().trim().min(1).max(120).transform(sanitizeText),
  name: z.string().trim().min(1).max(180).transform(sanitizeText),
  mediaType: z.string().trim().min(1).max(120).transform(sanitizeText),
  size: z.number().int().min(0).max(5 * 1024 * 1024),
  kind: z.enum(["image", "text", "file"]),
  dataUrl: z.string().max(7_000_000).optional(),
  extractedText: z.string().max(20_000).transform(sanitizeText).optional(),
}).superRefine((attachment, ctx) => {
  try {
    assertAttachmentSafe(attachment);
  } catch (err) {
    ctx.addIssue({
      code: "custom",
      message: err instanceof Error ? err.message : "Invalid attachment.",
    });
  }
});

export const chatRequestSchema = z.object({
  conversationId: uuidSchema.optional(),
  auditId: uuidSchema.optional(),
  message: z
    .string()
    .trim()
    .min(1, "Message is required.")
    .max(2000, "Message must be 2,000 characters or fewer.")
    .transform(sanitizeText),
  pagePath: z.string().trim().max(300).transform(sanitizeText).optional(),
  clientContext: z
    .object({
      pageTitle: z.string().trim().max(160).transform(sanitizeText).optional(),
      selectedToolId: z.string().trim().max(80).transform(sanitizeText).optional(),
    })
    .optional(),
  attachments: z.array(chatAttachmentSchema).max(4).optional(),
});

export type ChatRequestBody = z.infer<typeof chatRequestSchema>;

export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message || "Invalid chat request.";
}
