"use client";

import { useRef } from "react";
import Image from "next/image";
import { ImagePlus, Info, X } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  ACCEPT_ATTRIBUTE,
  MAX_FILE_COUNT,
  MAX_FILE_SIZE_BYTES,
  formatFileSize,
  type SelectedEvidence,
} from "@/lib/report/evidence";

type StepEvidenceProps = {
  readonly evidence: readonly SelectedEvidence[];
  readonly onAdd: (files: FileList | null) => void;
  readonly onRemove: (id: string) => void;
  readonly error?: string;
};

/**
 * Evidence selection. Nothing is uploaded here — files stay in the browser as
 * object URLs until the storage task is implemented, and the UI says so rather
 * than implying the image is safely stored.
 */
export function StepEvidence({ evidence, onAdd, onRemove, error }: StepEvidenceProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isAtLimit = evidence.length >= MAX_FILE_COUNT;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Add evidence (optional)</h2>
        <p className="text-sm text-muted-foreground">
          A photo helps explain the problem. You can continue without one.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        multiple
        className="sr-only"
        aria-label="Choose image evidence"
        onChange={(event) => {
          onAdd(event.target.files);
          event.target.value = "";
        }}
      />

      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={isAtLimit}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus aria-hidden="true" />
          {evidence.length > 0 ? "Add another photo" : "Choose a photo"}
        </Button>
        <p className="text-xs text-muted-foreground">
          JPEG, PNG, WebP or HEIC. Up to {formatFileSize(MAX_FILE_SIZE_BYTES)} each,{" "}
          {MAX_FILE_COUNT} photos maximum.
          {isAtLimit ? " You have reached the limit." : ""}
        </p>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {evidence.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No photo selected. That is fine — your description alone is enough to
            create a report.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {evidence.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-border p-3"
            >
              <Image
                src={item.previewUrl}
                alt={`Preview of ${item.file.name}`}
                width={56}
                height={56}
                unoptimized
                className="size-14 shrink-0 rounded-md object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(item.file.size)} &middot; selected, not yet uploaded
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove ${item.file.name}`}
                onClick={() => onRemove(item.id)}
              >
                <X aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Alert>
        <Info />
        <AlertDescription>
          Attaching a photo does not make it proof. CivicProof records what you
          provide and never treats an image as verified just because it was
          uploaded.
        </AlertDescription>
      </Alert>
    </div>
  );
}
