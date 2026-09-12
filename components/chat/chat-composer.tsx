"use client";

import { useRef, type FormEvent } from "react";
import { ArrowUp, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ChatComposerProps = {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onSend: () => void;
  readonly isBusy: boolean;
};

/**
 * The message box.
 *
 * Enter sends and Shift+Enter makes a new line, which is what people expect
 * from a chat. The button stays visible but disabled while busy rather than
 * disappearing, so the layout does not jump mid-conversation.
 */
export function ChatComposer({ value, onChange, onSend, isBusy }: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0 && !isBusy;

  function submit(event: FormEvent) {
    event.preventDefault();

    if (canSend) {
      onSend();
    }
  }

  return (
    <form onSubmit={submit} className="flex items-end gap-2">
      <label htmlFor="sahayak-message" className="sr-only">
        Your message
      </label>
      <Textarea
        id="sahayak-message"
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (canSend) onSend();
          }
        }}
        rows={1}
        maxLength={2000}
        placeholder="Describe your situation…"
        disabled={isBusy}
        className="max-h-40 min-h-12 flex-1 resize-none py-3"
      />

      <Button
        type="submit"
        size="icon-lg"
        disabled={!canSend}
        aria-label="Send message"
        className="shrink-0"
      >
        {isBusy ? (
          <Loader2 aria-hidden="true" className="size-5 animate-spin" />
        ) : (
          <ArrowUp aria-hidden="true" className="size-5" />
        )}
      </Button>
    </form>
  );
}
