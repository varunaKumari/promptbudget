"use client";

import { Component, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatErrorBoundaryState {
  hasError: boolean;
}

export class ChatErrorBoundary extends Component<
  { children: ReactNode },
  ChatErrorBoundaryState
> {
  state: ChatErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ChatErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[chat] UI error:", error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        className="fixed inset-x-3 bottom-24 z-50 rounded-lg border border-danger/25 bg-card p-4 shadow-lg sm:inset-x-auto sm:right-6 sm:max-w-sm"
        role="alert"
      >
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <AlertCircle className="h-4 w-4 text-danger" />
          Assistant needs a refresh
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          The chat UI hit a recoverable error.
        </p>
        <Button
          type="button"
          size="sm"
          onClick={() => this.setState({ hasError: false })}
        >
          Reload assistant
        </Button>
      </div>
    );
  }
}
