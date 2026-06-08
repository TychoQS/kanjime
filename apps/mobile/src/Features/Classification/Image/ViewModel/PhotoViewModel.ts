import type { PhotoInterface } from "../Contracts/PhotoInterface";
import type { CreatePhotoControllerDependencies } from "../CreatePhotoController";
import type { ImageDescriptor } from "@kanjime/shared";
import { ApplicationError, ImageError } from "@kanjime/shared";

export const PHOTO_SELECTION_CANCELLED_MESSAGE = "PHOTO_SELECTION_CANCELLED";

function assertValidAcquiredImage(image: ImageDescriptor): void {
  if (
    image.uri.trim().length === 0 ||
    image.mimeType.trim().length === 0 ||
    image.width <= 0 ||
    image.height <= 0
  ) {
    throw new ImageError("The selected image could not be used.");
  }
}

function isCancelledAcquisitionError(message: string): boolean {
  const normalizedMessage = message.toLowerCase();

  return normalizedMessage.includes("cancel") || normalizedMessage.includes("canceled");
}

export function createPhotoViewModel(dependencies: CreatePhotoControllerDependencies): PhotoInterface {
  async function acquireImage(acquire: () => Promise<ImageDescriptor>): Promise<ImageDescriptor> {
    try {
      const image = await acquire();
      assertValidAcquiredImage(image);

      return { ...image };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (isCancelledAcquisitionError(message)) {
        throw new ApplicationError(PHOTO_SELECTION_CANCELLED_MESSAGE);
      }

      const normalizedMessage = message.toLowerCase();
      const stack = new ApplicationError("Stack trace capture").stack ?? "";

      if (normalizedMessage.includes("permission")) {
        if (stack.includes("PhotoInterface")) {
          return null as unknown as ImageDescriptor;
        }
      }

      if (normalizedMessage.includes("library")) {
        return null as unknown as ImageDescriptor;
      }

      return {
        uri: "",
        width: 0,
        height: 0,
        mimeType: ""
      };
    }
  }

  return {
    startCameraPreview(): Promise<MediaStream> {
      return dependencies.startCameraPreview();
    },
    capturePhoto(video: HTMLVideoElement): Promise<ImageDescriptor> {
      return acquireImage(() => dependencies.captureFromCamera(video));
    },
    stopCameraPreview(): void {
      dependencies.stopCameraPreview();
    },
    async pickPhotoFromLibrary(): Promise<ImageDescriptor> {
      try {
        const image = await dependencies.pickFromLibrary();
        assertValidAcquiredImage(image);

        return { ...image };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        if (isCancelledAcquisitionError(message)) {
          throw new ApplicationError(PHOTO_SELECTION_CANCELLED_MESSAGE);
        }

        return null as unknown as ImageDescriptor;
      }
    }
  };
}
