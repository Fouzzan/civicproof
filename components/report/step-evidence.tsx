"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Info, Lock, Trash2, Upload } from "lucide-react";
import { cn } from "cn";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  ACCEPT_ATTRIBUTE,
  formatFileSize,
  MAX_FILE_COUNT,
  MAX_FILE_SIZE_BYTES,
  type SelectedEvidence,
} from "@/lib/report/evidence";

type StepEvidenceProps = {
  readonly evidence: readonly SelectedEvidence[];
  readonly onAdd: (files: FileList | null) => void;
  readonly onRemove: (id: string) => void;
  readonly error?: string;
  readonly isSensitive: boolean;
};

/**
 * Evidence selection.
 *
 * Nothing uploads here: files stay in the browser until the case is filed, so a
 * report that is never submitted leaves nothing behind in storage.
 *
 * The privacy line is load-bearing. A photo on an ordinary civic report may be
 * read by the AI review; a photo on a sensitive report never is. People deserve
 * to know which of those applies before they attach anything.
 */
export function StepEvidence({
  evidence,
  onAdd,
  onRemove,
  error,
  isSensitive,
}: StepEvidenceProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isAtLimit = evidence.length >= MAX_FILE_COUNT;

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold tracking-tight">Add a photo</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Optional, but a photo usually explains the problem faster than words.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        multiple
        className="sr-only"
        onChange={(event) => {
          onAdd(event.target.files);
          event.target.value = "";
        }}
      />

      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!isAtLimit) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (!isAtLimit) onAdd(event.dataTransfer.files);
        }}
        className={cn(
          "rounded-xl border border-dashed p-6 text-center transition-all duration-200",
          isDragging
            ? "border-primary bg-primary/[0.04] ring-1 ring-primary/20"
            : "border-input bg-card hover:bg-muted/40",
          isAtLimit && "opacity-60",
        )}
      >
        <span className="mx-auto flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Upload aria-hidden="true" className="size-5" />
        </span>

        <p className="mt-3 text-sm font-medium">
          {isAtLimit ? "Photo limit reached" : "Drag a photo here"}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          JPEG, PNG, WebP or HEIC &middot; up to{" "}
          {formatFileSize(MAX_FILE_SIZE_BYTES)} each &middot; {MAX_FILE_COUNT}{" "}
          maximum
        </p>

        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={isAtLimit}
          onClick={() => inputRef.current?.click()}
          className="mt-4"
        >
          <ImagePlus aria-hidden="true" />
          {evidence.length > 0 ? "Add another photo" : "Choose a photo"}
        </Button>
      </div>

      {error ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}

      {evidence.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Selected ({evidence.length} of {MAX_FILE_COUNT})
          </p>
          <ul className="grid gap-3 sm:grid-cols-3">
            {evidence.map((item) => (
              <li
                key={item.id}
                className="animate-in fade-in zoom-in-95 group relative overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-foreground/10 duration-200"
              >
                <div className="relative aspect-[4/3] bg-muted">
                  <Image
                    src={item.previewUrl}
                    alt={`Preview of ${item.file.name}`}
                    fill
                    unoptimized
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>

                <div className="px-3 py-2.5">
                  <p className="truncate text-xs font-medium">{item.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(item.file.size)} &middot; ready to upload
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => onRemove(item.id)}
                  aria-label={`Remove ${item.file.name}`}
                  className="absolute top-2 right-2 bg-card/90 backdrop-blur-sm hover:text-destructive"
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {isSensitive ? (
        <Alert>
          <Lock />
          <AlertDescription>
            This is a private report. Your photos are stored privately, are never
            published, and are <strong>not</strong> sent to any AI service.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <Info />
          <AlertDescription>
            Photos are stored privately and never published. On ordinary civic
            reports like this one, they are also read by the AI review in the next
            step to help describe the problem. Attaching a photo does not make it
            proof.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
