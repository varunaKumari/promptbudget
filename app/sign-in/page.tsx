import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to PromptBudget to manage AI spend audits and reports.",
};

export default function SignInPage() {
  redirect("/login");
}
