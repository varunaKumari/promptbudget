import { z } from "zod";

const uuidSchema = z.string().uuid();

export const chatRequestSchema = z.object({
  conversationId: uuidSchema.optional(),
  auditId: uuidSchema.optional(),
  message: z
    .string()
    .trim()
    .min(1, "Message is required.")
    .max(2000, "Message must be 2,000 characters or fewer."),
  pagePath: z.string().trim().max(300).optional(),
  clientContext: z
    .object({
      pageTitle: z.string().trim().max(160).optional(),
      selectedToolId: z.string().trim().max(80).optional(),
    })
    .optional(),
});

export type ChatRequestBody = z.infer<typeof chatRequestSchema>;

export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message || "Invalid chat request.";
}
