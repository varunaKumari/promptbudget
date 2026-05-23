"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function AuthCallbackClient() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    async function finishSignIn() {
      const url = new URL(window.location.href);
      const next = url.searchParams.get("next") || "/audit";
      const code = url.searchParams.get("code");
      const errorDescription =
        url.searchParams.get("error_description") || url.searchParams.get("error");

      if (errorDescription) {
        setError(errorDescription);
        return;
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError(exchangeError.message);
          return;
        }
      } else {
        await supabase.auth.getSession();
      }

      router.replace(next.startsWith("/") ? next : "/audit");
      router.refresh();
    }

    void finishSignIn();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 text-black">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-black">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
        <h1 className="text-3xl font-semibold tracking-normal">
          {error ? "Sign-in link failed" : "Opening your audit"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-black/58" role={error ? "alert" : "status"}>
          {error || "Securing your PromptBudget session and redirecting you to the audit page."}
        </p>
      </div>
    </main>
  );
}
