import type { Metadata } from "next";
import { AuthCallbackClient } from "./auth-callback-client";

export const metadata: Metadata = {
  title: "Signing in",
};

export default function AuthCallbackPage() {
  return <AuthCallbackClient />;
}
