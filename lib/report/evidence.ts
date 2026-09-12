/**
 * Client-side evidence constraints.
 *
 * These exist for UX only — to catch an obviously wrong file before the citizen
 * gets to the end of the flow. They are NOT a security control: the server must
 * re-check type and size when upload is actually implemented
 * (Docs/13-SECURITY.md §10).
 */
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
] as const;

export const ACCEPT_ATTRIBUTE = ACCEPTED_IMAGE_TYPES.join(",");
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_FILE_COUNT = 5;

export type SelectedEvidence = {
  readonly id: string;
  readonly file: File;
  readonly previewUrl: string;
};

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Returns an error message, or null when the file is acceptable.
 */
export function validateEvidenceFile(file: File): string | null {
  const isAcceptedType = (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type);

  if (!isAcceptedType) {
    return `"${file.name}" is not a supported image. Use JPEG, PNG, WebP or HEIC.`;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `"${file.name}" is ${formatFileSize(file.size)}. The limit is ${formatFileSize(MAX_FILE_SIZE_BYTES)}.`;
  }

  return null;
}
