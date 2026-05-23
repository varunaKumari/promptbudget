import { Resend } from "resend";

// ────────────────────────────────────────────
// Email client with safe initialization
// ────────────────────────────────────────────

const apiKey = process.env.RESEND_API_KEY;

const isResendConfigured =
  !!apiKey && apiKey.startsWith("re_") && apiKey.length > 10;

// Create client even if key is invalid — methods will be guarded
export const resend = new Resend(apiKey || "re_placeholder");

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send an email via Resend with proper error handling.
 * Logs a warning and returns gracefully if Resend is not configured.
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  if (!isResendConfigured) {
    console.warn(
      `[email] Resend not configured — skipping email to ${options.to}: "${options.subject}"`
    );
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from:
        options.from ||
        process.env.RESEND_FROM_EMAIL ||
        "PromptBudget <onboarding@resend.dev>",
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error("[email] Resend API error:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[email] Resend exception:", err);
    return false;
  }
}
