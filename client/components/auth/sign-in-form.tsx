"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type FormStatus = "idle" | "loading" | "sent" | "error";

export function SignInForm() {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [resetStatus, setResetStatus] = useState<FormStatus>("idle");

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/audit");
    });
  }, [router]);

  const handlePasswordSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (!isSupabaseConfigured) {
      setStatus("error");
      setMessage("Authentication is temporarily unavailable.");
      return;
    }

    setStatus("loading");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    router.push("/audit");
    router.refresh();
  };

  const handleGoogleSignIn = async () => {
    setMessage("");

    if (!isSupabaseConfigured) {
      setStatus("error");
      setMessage("Authentication is temporarily unavailable.");
      return;
    }

    setStatus("loading");

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent("/audit")}`
        : undefined;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
    }
  };

  const handleResetPassword = async () => {
    setMessage("");

    if (!email.trim()) {
      setStatus("error");
      setMessage("Enter your email first, then reset your password.");
      emailRef.current?.focus();
      return;
    }

    setResetStatus("loading");

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = (await response.json()) as { success?: boolean; error?: string };

    if (!response.ok || !data.success) {
      setResetStatus("error");
      setStatus("error");
      setMessage(data.error || "Unable to send reset email. Please try again.");
      return;
    }

    setResetStatus("sent");
    setStatus("sent");
    setMessage("Check your email for a PromptBudget password reset link.");
  };

  const useDifferentEmail = () => {
    setEmail("");
    setPassword("");
    setMessage("");
    setStatus("idle");
    setResetStatus("idle");
    window.requestAnimationFrame(() => emailRef.current?.focus());
  };

  return (
    <form onSubmit={handlePasswordSignIn} className="w-full max-w-[720px]">
      <h1 className="text-3xl font-semibold tracking-normal text-black sm:text-4xl">
        Welcome to PromptBudget
      </h1>

      <div className="mt-7 border border-black/20 bg-white px-4 py-2 transition-colors focus-within:border-black focus-within:ring-2 focus-within:ring-primary/45">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <label htmlFor="email" className="block text-sm text-black/52">
              Email address*
            </label>
            <input
              ref={emailRef}
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-9 w-full border-0 bg-transparent text-lg text-black outline-none"
              aria-describedby={message ? "sign-in-message" : undefined}
            />
          </div>
          <LockKeyhole className="h-5 w-5 shrink-0 text-black/40" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-5 border border-black/20 bg-white px-4 py-2 transition-colors focus-within:border-black focus-within:ring-2 focus-within:ring-primary/45">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password (required)"
              className="h-11 w-full border-0 bg-transparent text-lg text-black outline-none placeholder:text-black/58"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="flex h-9 w-9 shrink-0 items-center justify-center text-black/70 transition-colors hover:text-black"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 text-sm">
        <button
          type="button"
          onClick={useDifferentEmail}
          className="inline-flex items-center gap-2 text-black/62 underline underline-offset-4 transition-colors hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Use a different email
        </button>
        <button
          type="button"
          onClick={handleResetPassword}
          disabled={resetStatus === "loading"}
          className="text-black/62 underline underline-offset-4 transition-colors hover:text-black disabled:pointer-events-none disabled:opacity-60"
        >
          {resetStatus === "loading" ? "Sending reset..." : "Reset password"}
        </button>
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-14 flex h-[70px] w-full items-center justify-center gap-2 bg-primary px-6 text-lg font-semibold text-black transition-all hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-70"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Signing in
          </>
        ) : (
          "Sign in to PromptBudget"
        )}
      </button>

      <div className="my-12 grid grid-cols-[1fr_auto_1fr] items-center gap-8 text-sm text-black/56">
        <span className="h-px bg-black/12" />
        <span>or</span>
        <span className="h-px bg-black/12" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={status === "loading"}
        className="flex h-[70px] w-full items-center justify-center gap-3 border border-black/20 bg-white px-6 text-lg font-semibold text-black transition-all hover:border-black/40 hover:bg-black/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-70"
      >
        <span className="text-xl font-bold text-[#4285F4]" aria-hidden="true">
          G
        </span>
        Sign in with Google
      </button>

      {message && (
        <p
          id="sign-in-message"
          role={status === "error" ? "alert" : "status"}
          className={`mt-4 text-sm ${status === "error" ? "text-danger" : "text-black/68"}`}
        >
          {message}
        </p>
      )}

      <p className="mt-5 text-base text-black/64">
        Looking to get started with PromptBudget for your business?{" "}
        <Link
          href="/audit"
          className="font-medium text-black underline underline-offset-4 transition-opacity hover:opacity-70"
        >
          Sign up
        </Link>
      </p>

      <p className="mt-2 text-sm text-black/46">
        Need to end this session?{" "}
        <Link href="/sign-out" className="text-black underline underline-offset-4">
          Sign out
        </Link>
      </p>
    </form>
  );
}
