import type { Metadata } from "next";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Update password",
};

export default function UpdatePasswordPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="px-6 py-10 sm:px-10 lg:px-16">
        <Logo size="lg" href="/" />
      </div>
      <section className="flex min-h-[calc(100vh-150px)] items-center justify-center px-6 pb-20">
        <UpdatePasswordForm />
      </section>
    </main>
  );
}
