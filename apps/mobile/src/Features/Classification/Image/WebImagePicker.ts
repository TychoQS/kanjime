import type { ImageDescriptor } from "@kanjime/shared";
import { ImageError } from "@kanjime/shared";

const IMAGE_SELECTION_ERROR_MESSAGE = "The selected image could not be used.";
const IMAGE_SELECTION_CANCELLED_MESSAGE = "PHOTO_SELECTION_CANCELLED";

function loadImageDimensions(uri: string): Promise<{ readonly width: number; readonly height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({
      width: image.naturalWidth,
      height: image.naturalHeight
    });
    image.onerror = () => reject(new ImageError(IMAGE_SELECTION_ERROR_MESSAGE));
    image.src = uri;
  });
}

export async function pickImageFromDevice(): Promise<ImageDescriptor> {
  if (typeof document === "undefined") {
    throw new ImageError(IMAGE_SELECTION_ERROR_MESSAGE);
  }

  const file = await new Promise<File>((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";

    const cleanup = (): void => {
      input.removeEventListener("change", handleChange);
      document.body.removeChild(input);
    };

    const handleChange = (): void => {
      const selectedFile = input.files?.[0] ?? null;
      cleanup();

      if (selectedFile === null) {
        reject(new Error(IMAGE_SELECTION_CANCELLED_MESSAGE));
        return;
      }

      resolve(selectedFile);
    };

    input.addEventListener("change", handleChange, { once: true });
    document.body.appendChild(input);
    input.click();
  });

  const uri = URL.createObjectURL(file);
  let shouldRevokeObjectUrl = true;

  try {
    const dimensions = await loadImageDimensions(uri);
    shouldRevokeObjectUrl = false;

    return {
      uri,
      width: dimensions.width,
      height: dimensions.height,
      mimeType: file.type || "image/jpeg"
    };
  } finally {
    if (shouldRevokeObjectUrl) {
      URL.revokeObjectURL(uri);
    }
  }
}
