"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { isEmailValid } from "@/lib/auth";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (!isEmailValid(email)) {
      setStatus("error");
      setMessage("Enter a valid email address.");
      return;
    }

    setStatus("loading");

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });

    const data = (await response.json()) as { success?: boolean; error?: string };

    if (!response.ok || !data.success) {
      const errorMessage = data.error || "Unable to send reset email. Please try again.";
      setStatus("error");
      setMessage(errorMessage);
      toast.error(errorMessage);
      return;
    }

    setStatus("success");
    setMessage("Check your inbox for a password reset link.");
    toast.success("Reset email sent. Check your inbox.");
  };

  const disabled = status === "loading";

  return (
    <div className="w-full max-w-[410px] rounded-[24px] border border-border bg-card/90 p-4 text-foreground shadow-[0_24px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045] dark:text-white dark:shadow-[0_24px_90px_rgba(0,0,0,0.45)] sm:p-5">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-semibold sm:text-4xl">Forgot your password?</h1>
        <p className="mt-2 text-sm text-muted-foreground dark:text-white/58">
          Enter your email and we&apos;ll send a secure reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-muted-foreground dark:text-white/58">Email</span>
          <span className="flex h-10 items-center gap-3 rounded-xl border border-input bg-background px-4 transition-all focus-within:border-blue-400/70 focus-within:ring-4 focus-within:ring-blue-500/10 dark:border-white/10 dark:bg-black/20">
            <Mail className="h-4 w-4 text-muted-foreground dark:text-white/36" />
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground dark:text-white dark:placeholder:text-white/28"
              placeholder="you@company.com"
            />
          </span>
        </label>

        {message && (
          <p className={`rounded-2xl border px-4 py-3 text-sm ${status === "error" ? "border-red-400/20 bg-red-500/10 text-red-200" : "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"}`} role={status === "error" ? "alert" : "status"}>
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={disabled}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-blue-500 px-5 text-sm font-bold text-white shadow-[0_16px_42px_rgba(59,130,246,0.34)] transition-all hover:-translate-y-0.5 hover:bg-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090c14] disabled:pointer-events-none disabled:opacity-65"
        >
          {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {disabled ? "Sending reset link" : "Send reset link"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground dark:text-white/52">
        Remembered your password?{' '}
        <Link
          href="/login"
          className="font-semibold text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-300 dark:hover:text-blue-200"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
