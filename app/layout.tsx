import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://promptbudget.vercel.app"
  ),
  title: {
    default: "PromptBudget — Free AI Spend Audit for Startups",
    template: "%s — PromptBudget",
  },
  description:
    "Find out if you're overspending on AI tools. Free audit of your Cursor, Copilot, Claude, ChatGPT, and Gemini subscriptions — with actionable savings.",
  keywords: [
    "AI spend audit",
    "AI tools cost",
    "Cursor pricing",
    "Copilot pricing",
    "Claude pricing",
    "ChatGPT pricing",
    "AI budget optimization",
    "startup AI costs",
  ],
  openGraph: {
    title: "PromptBudget — Free AI Spend Audit for Startups",
    description:
      "Your team is probably overspending on AI tools. Find out in 2 minutes.",
    type: "website",
    siteName: "PromptBudget",
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptBudget — Free AI Spend Audit",
    description:
      "Your team is probably overspending on AI tools. Find out in 2 minutes.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: "!bg-card !text-foreground !border-border !shadow-lg",
            duration: 3000,
          }}
        />
      </body>
    </html>
  );
}
