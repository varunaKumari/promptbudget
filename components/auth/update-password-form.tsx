"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    router.push("/audit");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[720px]">
      <h1 className="text-3xl font-semibold tracking-normal text-black sm:text-4xl">
        Create a new password
      </h1>
      <p className="mt-3 text-base text-black/58">
        Choose a secure password for your PromptBudget account.
      </p>

      <div className="mt-7 border border-black/20 bg-white px-4 py-2 transition-colors focus-within:border-black focus-within:ring-2 focus-within:ring-primary/45">
        <div className="flex items-center gap-3">
          <input
            id="new-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="New password"
            className="h-12 min-w-0 flex-1 border-0 bg-transparent text-lg text-black outline-none placeholder:text-black/58"
          />
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

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-5 flex h-[70px] w-full items-center justify-center gap-2 bg-primary px-6 text-lg font-semibold text-black transition-all hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-70"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Updating password
          </>
        ) : (
          "Update password"
        )}
      </button>

      {message && (
        <p className="mt-4 text-sm text-danger" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}
