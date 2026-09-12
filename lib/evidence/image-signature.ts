/**
 * Magic-byte sniffing for uploaded images.
 *
 * Docs/13-SECURITY.md §10: "Do not trust only the browser-provided MIME type or
 * filename." A client can label any bytes as image/png, so the server confirms
 * the file really starts like the image format it claims to be.
 */
const JPEG = [0xff, 0xd8, 0xff];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const RIFF = [0x52, 0x49, 0x46, 0x46]; // "RIFF"
const WEBP = [0x57, 0x45, 0x42, 0x50]; // "WEBP" at offset 8

/** ISO-BMFF brands used by HEIC/HEIF, found at offset 8 after "ftyp". */
const HEIF_BRANDS = ["heic", "heix", "hevc", "hevx", "mif1", "msf1", "heim", "heis"];

function startsWith(bytes: Uint8Array, signature: readonly number[], offset = 0): boolean {
  return signature.every((byte, index) => bytes[offset + index] === byte);
}

function isHeif(bytes: Uint8Array): boolean {
  // ....ftyp<brand>
  const ftyp = String.fromCharCode(...bytes.slice(4, 8));

  if (ftyp !== "ftyp") {
    return false;
  }

  return HEIF_BRANDS.includes(String.fromCharCode(...bytes.slice(8, 12)));
}

/**
 * The image format the bytes actually are, or null if they are not a supported
 * image at all.
 */
export function detectImageType(bytes: Uint8Array): string | null {
  if (startsWith(bytes, JPEG)) {
    return "image/jpeg";
  }

  if (startsWith(bytes, PNG)) {
    return "image/png";
  }

  if (startsWith(bytes, RIFF) && startsWith(bytes, WEBP, 8)) {
    return "image/webp";
  }

  if (isHeif(bytes)) {
    return "image/heic";
  }

  return null;
}
