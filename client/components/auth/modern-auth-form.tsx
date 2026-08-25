"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Provider } from "@supabase/supabase-js";
import {
  Building2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { toast } from "sonner";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { getPasswordValidation, isEmailValid, isPasswordStrong } from "@/lib/auth";

type AuthMode = "login" | "signup";
type FormStatus = "idle" | "loading" | "success" | "error";

interface ModernAuthFormProps {
  mode: AuthMode;
}

const oauthButtons = [
  { label: "Google", provider: "google", icon: GoogleGlyph },
  { label: "GitHub", provider: "github", icon: GithubGlyph },
] satisfies Array<{
  label: string;
  provider: Provider;
  icon: ComponentType<{ className?: string }>;
}>;

const iconProviders = [
  { label: "Microsoft", provider: "azure", icon: MicrosoftGlyph },
  { label: "LinkedIn", provider: "linkedin_oidc", icon: LinkedInGlyph },
  { label: "Facebook", provider: "facebook", icon: FacebookGlyph },
] satisfies Array<{
  label: string;
  provider: Provider;
  icon: ComponentType<{ className?: string }>;
}>;

export function ModernAuthForm({ mode }: ModernAuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [activeProvider, setActiveProvider] = useState<string | null>(null);

  const isSignup = mode === "signup";

  const copy = useMemo(
    () => ({
      heading: isSignup ? "Get started" : "Welcome back!",
      subheading: isSignup ? "Build your AI agent today" : "Log in to your account",
      primary: isSignup ? "Register" : "Login",
      loading: isSignup ? "Creating account" : "Logging in",
      oauthPrefix: isSignup ? "Sign up with" : "Continue with",
    }),
    [isSignup]
  );

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/audit");
    });
  }, [router]);

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent("/audit")}`
      : undefined;

  const setError = (nextMessage: string) => {
    setStatus("error");
    setMessage(nextMessage);
    setActiveProvider(null);
  };

  const validate = () => {
    if (!isEmailValid(email)) {
      setError("Enter a valid email address.");
      return false;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }

    if (isSignup && !/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      return false;
    }

    if (isSignup && !/\d/.test(password)) {
      setError("Password must contain at least one number.");
      return false;
    }

    if (isSignup && !/[^A-Za-z0-9]/.test(password)) {
      setError("Password must contain at least one special character.");
      return false;
    }

    return true;
  };

  const handleEmailAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (!validate()) return;

    if (!isSupabaseConfigured) {
      setError("Unable to complete authentication. Please try again later.");
      return;
    }

    setStatus("loading");

    const normalizedEmail = email.trim().toLowerCase();
    const { error, data } = isSignup
      ? await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: { emailRedirectTo: redirectTo },
        })
      : await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

    if (error) {
      setError(error.message);
      toast.error(error.message);
      return;
    }

    if (isSignup) {
      if (data.session) {
        setStatus("success");
        setMessage("Account created. Redirecting to your audit...");
        router.push("/audit");
        return;
      }

      setStatus("success");
      setMessage("Account created. Check your email to confirm your address before signing in.");
      toast.success("Verification email sent.");
      return;
    }

    router.push("/audit");
    router.refresh();
  };

  const handleOAuth = async (provider: Provider) => {
    setMessage("");

    if (!isSupabaseConfigured) {
      setError("Unable to complete authentication. Please try again later.");
      return;
    }

    setStatus("loading");
    setActiveProvider(provider);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });

    if (error) {
      setError(error.message);
      toast.error(error.message);
    }
  };

  const handleSso = async () => {
    setMessage("");

    if (!isSupabaseConfigured) {
      setError("Unable to complete authentication. Please try again later.");
      return;
    }

    const domain = email.split("@")[1]?.trim();
    if (!domain) {
      setError("Enter your business email first to continue with Enterprise SSO.");
      return;
    }

    setStatus("loading");
    setActiveProvider("sso");

    const { error } = await supabase.auth.signInWithSSO({
      domain,
      options: { redirectTo },
    });

    if (error) {
      setError(error.message);
    }
  };

  const handleResetPassword = async () => {
    setMessage("");

    if (!email.trim()) {
      setError("Enter your email first, then reset your password.");
      return;
    }

    setStatus("loading");

    const normalizedEmail = email.trim().toLowerCase();
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail }),
    });

    const data = (await response.json()) as { success?: boolean; error?: string };

    if (!response.ok || !data.success) {
      const errorMessage = data.error || "Unable to send reset email. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    setStatus("success");
    setMessage("Check your email for a PromptBudget password reset link.");
    toast.success("Reset instructions sent to your inbox.");
  };

  const validation = useMemo(() => getPasswordValidation(password), [password]);
  const passwordWarning = !isSignup && password.length > 0 && !isPasswordStrong(password);
  const disabled = status === "loading";

  return (
    <div className="w-full max-w-[410px] rounded-[24px] border border-border bg-card/90 p-4 text-foreground shadow-[0_24px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045] dark:text-white dark:shadow-[0_24px_90px_rgba(0,0,0,0.45)] sm:p-5">
      <div className="mb-4 flex flex-col items-center text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted shadow-sm dark:border-white/12 dark:bg-white/[0.06] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
          <Logo size="lg" showText={false} href="" />
        </div>
        <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">{copy.heading}</h1>
        <p className="mt-1 text-sm font-medium text-muted-foreground dark:text-white/54">{copy.subheading}</p>
      </div>

      <div className="grid gap-2">
        {oauthButtons.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.provider}
              type="button"
              disabled={disabled}
              onClick={() => handleOAuth(item.provider)}
              className="flex h-9 items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 disabled:pointer-events-none disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.055] dark:text-white dark:hover:border-white/20 dark:hover:bg-white/[0.09]"
            >
              {activeProvider === item.provider ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              {copy.oauthPrefix} {item.label}
            </button>
          );
        })}
        <button
          type="button"
          disabled={disabled}
          onClick={handleSso}
          className="flex h-9 items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 disabled:pointer-events-none disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.055] dark:text-white dark:hover:border-white/20 dark:hover:bg-white/[0.09]"
        >
          {activeProvider === "sso" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Building2 className="h-4 w-4" />
          )}
          {copy.oauthPrefix} Enterprise SSO
        </button>
      </div>

      <div className="mt-2.5 flex items-center justify-center gap-2">
        {iconProviders.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.provider}
              type="button"
              disabled={disabled}
              onClick={() => handleOAuth(item.provider)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all hover:-translate-y-0.5 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 disabled:pointer-events-none disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/68 dark:hover:border-white/22 dark:hover:bg-white/[0.08] dark:hover:text-white"
              aria-label={`${copy.oauthPrefix} ${item.label}`}
            >
              {activeProvider === item.provider ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
            </button>
          );
        })}
      </div>

      <div className="my-3 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-xs font-medium text-muted-foreground dark:text-white/38">
        <span className="h-px bg-border dark:bg-white/10" />
        <span>or</span>
        <span className="h-px bg-border dark:bg-white/10" />
      </div>

      <form onSubmit={handleEmailAuth} className="space-y-2.5">
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
              aria-describedby={message ? "auth-message" : undefined}
            />
          </span>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-muted-foreground dark:text-white/58">Password</span>
          <span className="flex h-10 items-center gap-3 rounded-xl border border-input bg-background px-4 transition-all focus-within:border-blue-400/70 focus-within:ring-4 focus-within:ring-blue-500/10 dark:border-white/10 dark:bg-black/20">
            <LockKeyhole className="h-4 w-4 text-muted-foreground dark:text-white/36" />
            <input
              type={showPassword ? "text" : "password"}
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground dark:text-white dark:placeholder:text-white/28"
              placeholder="At least 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="text-muted-foreground transition-colors hover:text-foreground dark:text-white/45 dark:hover:text-white"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </span>
        </label>

        <div className="rounded-2xl border border-input bg-slate-50/80 p-3 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70">
          <div className="grid gap-2">
            {validation.map((rule) => (
              <div key={rule.label} className="flex items-center gap-2">
                <span
                  className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                    rule.isValid ? "bg-emerald-400 text-black" : "bg-muted text-muted-foreground"
                  }`}
                  aria-hidden="true"
                >
                  {rule.isValid ? "✓" : "○"}
                </span>
                <span className={rule.isValid ? "text-foreground" : "text-muted-foreground"}>{rule.label}</span>
              </div>
            ))}
          </div>
        </div>

        {passwordWarning ? (
          <p className="text-sm text-amber-500">
            We recommend a stronger password, but you can still log in with your existing credentials.
          </p>
        ) : null}

        {!isSignup && (
          <button
            type="button"
            disabled={disabled}
            onClick={handleResetPassword}
            className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-500 disabled:pointer-events-none disabled:opacity-60 dark:text-blue-300 dark:hover:text-blue-200"
          >
            Forgot your password?
          </button>
        )}

        {message && (
          <p
            id="auth-message"
            role={status === "error" ? "alert" : "status"}
            className={`rounded-2xl border px-4 py-3 text-sm ${
              status === "error"
                ? "border-red-400/20 bg-red-500/10 text-red-200"
                : "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={disabled}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-blue-500 px-5 text-sm font-bold text-white shadow-[0_16px_42px_rgba(59,130,246,0.34)] transition-all hover:-translate-y-0.5 hover:bg-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090c14] disabled:pointer-events-none disabled:opacity-65"
        >
          {disabled && !activeProvider ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {disabled && !activeProvider ? copy.loading : copy.primary}
        </button>
      </form>

      {isSignup ? (
        <>
          <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground dark:text-white/42">
            By registering, you agree to our{" "}
            <Link href="/privacy" className="text-foreground transition-colors hover:text-blue-600 dark:text-white/72 dark:hover:text-white">
              Privacy policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="text-foreground transition-colors hover:text-blue-600 dark:text-white/72 dark:hover:text-white">
              Terms & Conditions
            </Link>
            .
          </p>
          <p className="mt-4 text-center text-sm text-muted-foreground dark:text-white/52">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-300 dark:hover:text-blue-200">
              Log in
            </Link>
          </p>
        </>
      ) : (
        <p className="mt-4 text-center text-sm text-muted-foreground dark:text-white/52">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-300 dark:hover:text-blue-200">
            Sign up
          </Link>
        </p>
      )}
    </div>
  );
}

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <span className={`${className || ""} font-bold text-[#4285f4]`} aria-hidden="true">
      G
    </span>
  );
}

function GithubGlyph({ className }: { className?: string }) {
  return (
    <span className={`${className || ""} font-bold`} aria-hidden="true">
      GH
    </span>
  );
}

function LinkedInGlyph({ className }: { className?: string }) {
  return (
    <span className={`${className || ""} font-bold text-[#0a66c2]`} aria-hidden="true">
      in
    </span>
  );
}

function FacebookGlyph({ className }: { className?: string }) {
  return (
    <span className={`${className || ""} font-bold text-[#1877f2]`} aria-hidden="true">
      f
    </span>
  );
}

function MicrosoftGlyph({ className }: { className?: string }) {
  return (
    <span className={`${className || ""} grid grid-cols-2 gap-0.5`} aria-hidden="true">
      <span className="h-1.5 w-1.5 rounded-[1px] bg-[#f25022]" />
      <span className="h-1.5 w-1.5 rounded-[1px] bg-[#7fba00]" />
      <span className="h-1.5 w-1.5 rounded-[1px] bg-[#00a4ef]" />
      <span className="h-1.5 w-1.5 rounded-[1px] bg-[#ffb900]" />
    </span>
  );
}
