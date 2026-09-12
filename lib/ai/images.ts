import { detectImageType } from "@/lib/evidence/image-signature";

/**
 * Preparing photographs for multimodal analysis.
 *
 * Two hard rules live here and in the callers:
 *
 *  1. Sensitive cases never reach this module. Harassment, stalking and assault
 *     reports stay text-only; their evidence is not sent to any AI provider.
 *  2. Bytes are re-validated here even if they were validated on upload. A
 *     declared MIME type is a claim, not a fact (Docs/13-SECURITY.md §10).
 */
export const MAX_ANALYSIS_IMAGES = 2;
export const MAX_ANALYSIS_IMAGE_BYTES = 4 * 1024 * 1024;

export type AnalysisImage = {
  /** data: URL the provider can consume directly. */
  readonly dataUrl: string;
  readonly mediaType: string;
};

/**
 * Convert raw bytes into an image the provider will accept, or null when the
 * bytes are not a supported image or are too large.
 */
export function toAnalysisImage(bytes: Uint8Array): AnalysisImage | null {
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_ANALYSIS_IMAGE_BYTES) {
    return null;
  }

  const mediaType = detectImageType(bytes);

  if (!mediaType) {
    return null;
  }

  return {
    mediaType,
    dataUrl: `data:${mediaType};base64,${Buffer.from(bytes).toString("base64")}`,
  };
}

/**
 * Take at most MAX_ANALYSIS_IMAGES valid images, ignoring anything unusable
 * rather than failing the whole analysis over one bad file.
 */
export function collectAnalysisImages(
  candidates: readonly Uint8Array[],
): AnalysisImage[] {
  const images: AnalysisImage[] = [];

  for (const bytes of candidates) {
    if (images.length >= MAX_ANALYSIS_IMAGES) {
      break;
    }

    const image = toAnalysisImage(bytes);

    if (image) {
      images.push(image);
    }
  }

  return images;
}
