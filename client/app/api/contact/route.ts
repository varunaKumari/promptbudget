import { sendEmail } from "@/lib/email";

interface ContactPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  country?: string;
  message?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactPayload;
    const required = [
      body.firstName,
      body.lastName,
      body.email,
      body.phone,
      body.country,
      body.message,
    ];

    if (required.some((value) => !value || !String(value).trim())) {
      return Response.json(
        { success: false, error: "Please complete all required fields." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email || "")) {
      return Response.json(
        { success: false, error: "Enter a valid business email." },
        { status: 400 }
      );
    }

    if ((body.message || "").trim().length < 10) {
      return Response.json(
        { success: false, error: "Tell us a little more about how we can help." },
        { status: 400 }
      );
    }

    await sendEmail({
      to: process.env.CONTACT_TO_EMAIL || process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      subject: "New PromptBudget demo request",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h1>New demo request</h1>
          <p><strong>Name:</strong> ${escapeHtml(body.firstName)} ${escapeHtml(body.lastName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(body.email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(body.phone)}</p>
          <p><strong>Country:</strong> ${escapeHtml(body.country)}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(body.message).replace(/\n/g, "<br />")}</p>
        </div>
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("[contact] request failed:", error);
    return Response.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

function escapeHtml(value = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
