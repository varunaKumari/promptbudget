"use client";

import { motion } from "framer-motion";
import { MessageCircle, Sparkles } from "lucide-react";
import { useChatbot } from "./chatbot-provider";
import { cn } from "@/lib/utils";

export function FloatingChatButton() {
  const { isOpen, setIsOpen, status } = useChatbot();

  return (
    <motion.button
      type="button"
      aria-label={isOpen ? "Close PromptBudget assistant" : "Open PromptBudget assistant"}
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        "fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-border/60 bg-card/88 text-foreground shadow-[0_18px_60px_oklch(0_0_0_/_18%),0_1px_0_oklch(1_0_0_/_40%)_inset] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:bg-card md:bottom-6 md:right-6",
        "before:absolute before:inset-0 before:rounded-full before:bg-primary/24 before:blur-xl before:content-[''] after:absolute after:inset-[3px] after:rounded-full after:border after:border-white/20 after:content-['']"
      )}
      initial={{ opacity: 0, scale: 0.85, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
    >
      <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_28px_oklch(84.1%_0.238_128.85_/_28%)]">
        <motion.span
          initial={false}
          animate={{ rotate: isOpen ? 90 : 0, scale: isOpen ? 0.92 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {status === "streaming" ? (
            <Sparkles className="h-5 w-5" />
          ) : (
            <MessageCircle className="h-5 w-5" />
          )}
        </motion.span>
      </span>
      {!isOpen && (
        <motion.span
          className="absolute right-1 top-1 h-3 w-3 rounded-full border-2 border-card bg-success"
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        />
      )}
    </motion.button>
  );
}
