"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface AuthNavActionsProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export function AuthNavActions({ mobile = false, onNavigate }: AuthNavActionsProps) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let active = true;

    if (!isSupabaseConfigured) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
      router.refresh();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    setSigningOut(true);
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setSigningOut(false);
    onNavigate?.();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <span
        className={cn(
          "rounded-md bg-muted text-muted-foreground",
          mobile ? "block h-10 w-full" : "h-9 w-20"
        )}
        aria-hidden="true"
      />
    );
  }

  if (session) {
    return (
      <div className={cn("flex items-center gap-1", mobile && "block space-y-1")}>
        <Link
          href="/audit"
          onClick={onNavigate}
          className={cn(
            "font-semibold transition-colors hover:text-foreground",
            mobile
              ? "block rounded-md px-3 py-2 text-sm hover:bg-muted"
              : "inline-flex h-10 items-center justify-center rounded-md px-3 text-sm text-foreground/72 hover:bg-muted"
          )}
        >
          Audit
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className={cn(
            "font-semibold transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-60",
            mobile
              ? "block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
              : "inline-flex h-10 items-center justify-center rounded-md px-3 text-sm text-foreground/72 hover:bg-muted"
          )}
        >
          {signingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1", mobile && "block space-y-1")}>
      <Link
        href="/sign-in"
        onClick={onNavigate}
        className={cn(
          "font-semibold transition-colors hover:text-foreground",
          mobile
            ? "block rounded-md px-3 py-2 text-sm hover:bg-muted"
            : "inline-flex h-10 items-center justify-center rounded-md px-3 text-sm text-foreground/72 hover:bg-muted"
        )}
      >
        Sign in
      </Link>
      <Link
        href="/sign-out"
        onClick={onNavigate}
        className={cn(
          "font-semibold transition-colors hover:text-foreground",
          mobile
            ? "block rounded-md px-3 py-2 text-sm hover:bg-muted"
            : "inline-flex h-10 items-center justify-center rounded-md px-3 text-sm text-foreground/72 hover:bg-muted"
        )}
      >
        Sign out
      </Link>
    </div>
  );
}
