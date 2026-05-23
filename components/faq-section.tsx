"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What actions consume AI tokens?",
    answer:
      "AI tokens are consumed when PromptBudget analyzes spend data, summarizes vendor usage, generates recommendations, or answers questions with the assistant.",
  },
  {
    question: "Which consumes more AI Spend: Website KB source or Search The Web KB source?",
    answer:
      "Search The Web typically consumes more AI Spend because it has to retrieve, evaluate, and summarize fresh sources. Website KB sources are usually more predictable once the content is indexed.",
  },
  {
    question: "Is AI Spend calculated per message?",
    answer:
      "AI Spend is based on the model work behind each interaction, so longer prompts, larger knowledge sources, and deeper analysis can cost more than a short message.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="bg-[#070a12] px-5 py-20 text-white sm:px-8 lg:py-28">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-5xl font-semibold tracking-normal sm:text-6xl">FAQ</h2>

        <div className="mt-12 space-y-3">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.question}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-base font-semibold text-white transition-colors hover:bg-white/[0.035] sm:px-6"
                  aria-expanded={isOpen}
                >
                  {item.question}
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-white/48 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                    >
                      <p className="px-5 pb-5 text-sm leading-7 text-white/56 sm:px-6">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/12 bg-white/[0.045] px-6 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:border-white/24 hover:bg-white/[0.08]"
          >
            Still have questions? Get in touch!
          </Link>
        </div>
      </div>
    </section>
  );
}
