"use client";

import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Image as ImageIcon,
  Loader2,
  Mic,
  Paperclip,
  SendHorizontal,
  Square,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatbot } from "./chatbot-provider";
import type { ChatAttachment } from "./types";

export function ChatComposer() {
  const {
    input,
    setInput,
    attachments,
    setAttachments,
    sendMessage,
    stopStreaming,
    status,
    error,
    isOpen,
  } = useChatbot();
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [isListening, setIsListening] = useState(false);
  const isStreaming = status === "streaming";
  const canSend = (input.trim().length > 0 || attachments.length > 0) && !isStreaming;

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 180);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
      if (event.key === "Escape" && isStreaming) {
        stopStreaming();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isStreaming, stopStreaming]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (canSend) void sendMessage();
    }
  };

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).slice(0, 4 - attachments.length);
    if (files.length === 0) return;

    const next = await Promise.all(files.map(readAttachment));
    setAttachments([...attachments, ...next]);
    event.target.value = "";
  };

  const toggleVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setInput(`${input}${input ? " " : ""}Voice input is not supported in this browser.`);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;
    setIsListening(true);

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join("");
      setInput((prev) => `${prev}${prev && transcript ? " " : ""}${transcript}`.trim());
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <footer className="border-t border-border/65 bg-card/84 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-xl">
      {error && (
        <motion.p
          className="mb-2 rounded-md border border-danger/25 bg-danger/10 px-3 py-2 text-xs text-danger"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex max-w-full items-center gap-2 rounded-lg border border-border/75 bg-background/78 px-2 py-1.5 text-xs shadow-sm"
            >
              {attachment.kind === "image" ? (
                <ImageIcon className="h-3.5 w-3.5 text-primary" />
              ) : (
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className="max-w-[180px] truncate">{attachment.name}</span>
              <button
                type="button"
                aria-label={`Remove ${attachment.name}`}
                onClick={() =>
                  setAttachments(attachments.filter((item) => item.id !== attachment.id))
                }
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-end gap-1.5 rounded-xl border border-border/75 bg-background/82 p-2 shadow-[0_1px_0_oklch(1_0_0_/_45%)_inset,0_10px_30px_oklch(0_0_0_/_5%)] transition-shadow focus-within:border-primary/35 focus-within:shadow-[0_0_0_3px_oklch(84.1%_0.238_128.85_/_14%)]">
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          multiple
          accept="image/*,.txt,.md,.csv,.json,.log"
          onChange={handleFiles}
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label="Attach files"
          disabled={attachments.length >= 4 || isStreaming}
          onClick={() => fileRef.current?.click()}
          className="rounded-lg text-muted-foreground hover:text-foreground"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant={isListening ? "default" : "ghost"}
          aria-label={isListening ? "Stop voice input" : "Start voice input"}
          disabled={isStreaming}
          onClick={toggleVoice}
          className="rounded-lg text-muted-foreground hover:text-foreground"
        >
          <Mic className="h-4 w-4" />
        </Button>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={2000}
          placeholder="Ask about your AI spend..."
          className="chat-scrollbar max-h-28 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-relaxed outline-none placeholder:text-muted-foreground"
        />
        {isStreaming ? (
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="Stop response"
            onClick={stopStreaming}
            className="rounded-lg"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
          </Button>
        ) : (
          <motion.div whileTap={{ scale: 0.92 }}>
            <Button
              type="button"
              size="icon"
              aria-label="Send message"
              disabled={!canSend}
              onClick={() => void sendMessage()}
              className="rounded-lg shadow-[0_8px_22px_oklch(84.1%_0.238_128.85_/_18%)]"
            >
              {status === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SendHorizontal className="h-4 w-4" />
              )}
            </Button>
          </motion.div>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between px-1 text-[10px] leading-none text-muted-foreground">
        <span>Enter to send, Shift+Enter for a new line</span>
        <span>{isListening ? "Listening..." : "Ctrl/Cmd K"}</span>
      </div>
    </footer>
  );
}

async function readAttachment(file: File): Promise<ChatAttachment> {
  const isImage = file.type.startsWith("image/");
  const isText =
    file.type.startsWith("text/") ||
    /\.(txt|md|csv|json|log)$/i.test(file.name);

  return {
    id: crypto.randomUUID(),
    name: file.name,
    mediaType: file.type || "application/octet-stream",
    size: file.size,
    kind: isImage ? "image" : isText ? "text" : "file",
    dataUrl: isImage ? await readAsDataUrl(file) : undefined,
    extractedText: isText ? (await file.text()).slice(0, 20000) : undefined,
  };
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionLike;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}
