"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

type ContactStatus = "idle" | "loading" | "success" | "error";

const countries = ["United States", "India", "United Kingdom", "Canada", "Australia", "Germany", "Singapore", "Other"];

export function ContactForm() {
  const [status, setStatus] = useState<ContactStatus>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !data.success) {
        setStatus("error");
        setMessage(data.error || "Unable to submit your request. Please try again.");
        return;
      }

      setStatus("success");
      setMessage("Thanks. We received your request and will get back to you shortly.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.36)] backdrop-blur-xl sm:p-7"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First Name" name="firstName" autoComplete="given-name" required />
        <Field label="Last Name" name="lastName" autoComplete="family-name" required />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Business Email" name="email" type="email" autoComplete="email" required />
        <Field label="Phone Number" name="phone" type="tel" autoComplete="tel" required />
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-xs font-semibold text-white/58">Country</span>
        <select
          name="country"
          required
          defaultValue=""
          className="h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition-all focus:border-blue-400/70 focus:ring-4 focus:ring-blue-500/10"
        >
          <option value="" disabled className="bg-[#0b0f18]">
            Select country
          </option>
          {countries.map((country) => (
            <option key={country} value={country} className="bg-[#0b0f18]">
              {country}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-4 block">
        <span className="mb-2 block text-xs font-semibold text-white/58">How can we help?</span>
        <textarea
          name="message"
          required
          minLength={10}
          rows={5}
          className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/28 focus:border-blue-400/70 focus:ring-4 focus:ring-blue-500/10"
          placeholder="Tell us about your team, AI stack, and what you want to improve."
        />
      </label>

      {message && (
        <p
          role={status === "error" ? "alert" : "status"}
          className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
            status === "error"
              ? "border-red-400/20 bg-red-500/10 text-red-200"
              : "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
          }`}
        >
          {status === "success" ? <CheckCircle2 className="mr-2 inline h-4 w-4" /> : null}
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-blue-500 px-5 text-sm font-bold text-white shadow-[0_16px_42px_rgba(59,130,246,0.34)] transition-all hover:-translate-y-0.5 hover:bg-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090c14] disabled:pointer-events-none disabled:opacity-65"
      >
        {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Submit
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-white/58">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition-all placeholder:text-white/28 focus:border-blue-400/70 focus:ring-4 focus:ring-blue-500/10"
      />
    </label>
  );
}
