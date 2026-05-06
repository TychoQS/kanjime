/**
 * Small PNG image used by browser-level E2E flows.
 *
 * @pre Tests need a deterministic local image payload.
 * @post The exported data URL can be converted into a File inside Playwright.
 */
export const E2E_KANJI_IMAGE_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAApElEQVR4nO3aQQ6AIAwEwP7/T9sDuLGQhGKnTjDBs90LQZrDJEmSPsC9bOsCoG4dANTtAqBuHQDU7QKgbh0A1O0CoG4dANTtAqBuHQDU7QKgbh0A1O0CoG4dANTtAqBuHQDU7QKgbh0A1O0CoG4dANTtAqBuHQDU7QKgbh0A1O0CoG4dANTtAqBuHQDU7QKgbh0A1O0CoG4dANTtAqBuHQDU7QKgbh0A1O0CoG4dANTtAqBuHQDU7QKgbh0A1O0C4HVvAWp3XFTLEKcGAAAAAElFTkSuQmCC";

/**
 * Converts a data URL into a Playwright file payload.
 *
 * @pre The data URL contains base64 PNG bytes.
 * @post The returned object is accepted by file upload APIs.
 */
export function createE2EImageFile(): {
  readonly name: string;
  readonly mimeType: string;
  readonly buffer: Buffer;
} {
  const encoded = E2E_KANJI_IMAGE_DATA_URL.split(",")[1] ?? "";

  return {
    name: "kanji-e2e.png",
    mimeType: "image/png",
    buffer: Buffer.from(encoded, "base64")
  };
}
