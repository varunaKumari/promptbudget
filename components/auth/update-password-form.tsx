"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { getPasswordValidation, isPasswordStrong } from "@/lib/auth";
import { PasswordRequirements } from "@/components/auth/password-requirements";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const validation = useMemo(() => getPasswordValidation(password), [password]);
  const isValidPassword = isPasswordStrong(password);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (!isValidPassword) {
      setStatus("error");
      setMessage("Password must meet all security requirements before updating.");
      return;
    }

    setStatus("loading");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      const errorMessage = error.message || "Unable to update your password. Please try again.";
      setStatus("error");
      setMessage(errorMessage);
      toast.error(errorMessage);
      return;
    }

    toast.success("Password updated successfully.");
    router.push("/audit");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[720px] rounded-[24px] border border-border bg-card/90 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] sm:p-8">
      <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">Create a new password</h1>
      <p className="mt-3 max-w-2xl text-base text-muted-foreground">
        Choose a strong password to secure your PromptBudget account.
      </p>

      <div className="mt-7 rounded-3xl border border-input bg-background p-4 dark:border-white/10 dark:bg-black/20">
        <label className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-muted-foreground dark:text-white/58">New password</span>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-2 focus-within:border-blue-400/70 focus-within:ring-4 focus-within:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03]">
            <input
              id="new-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 min-w-0 flex-1 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground dark:text-white dark:placeholder:text-white/30"
              placeholder="Enter a secure password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="text-muted-foreground transition-colors hover:text-foreground dark:text-white/45 dark:hover:text-white"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </label>

        <div className="mt-4">
          <PasswordRequirements validation={validation} />
        </div>
      </div>

      {message && (
        <p className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${status === "error" ? "border-red-400/20 bg-red-500/10 text-red-200" : "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"}`} role="alert">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-6 flex h-[70px] w-full items-center justify-center gap-2 rounded-full bg-blue-500 px-6 text-lg font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-65"
      >
        {status === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
        {status === "loading" ? "Updating password" : "Update password"}
      </button>
    </form>
  );
}
