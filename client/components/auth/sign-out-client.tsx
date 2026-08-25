"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export function SignOutClient() {
  const router = useRouter();
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function signOut() {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      setDone(true);
      router.refresh();
    }

    void signOut();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 text-black">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-black">
          {done ? "✓" : <Loader2 className="h-5 w-5 animate-spin" />}
        </div>
        <h1 className="text-3xl font-semibold tracking-normal">
          {done ? "You are signed out" : "Signing out"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-black/58">
          {done
            ? "Your PromptBudget session has ended."
            : "Ending your PromptBudget session securely."}
        </p>
        {done && (
          <Link
            href="/"
            className="mt-7 inline-flex h-12 items-center justify-center bg-primary px-6 text-sm font-semibold text-black transition-all hover:brightness-95"
          >
            Return home
          </Link>
        )}
      </div>
    </main>
  );
}
