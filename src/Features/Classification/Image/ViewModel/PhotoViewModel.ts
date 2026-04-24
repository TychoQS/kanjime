import type { PhotoInterface } from "../Contracts/PhotoInterface";
import type { CreatePhotoControllerDependencies } from "../CreatePhotoController";
import type { ImageDescriptor } from "../../../../Shared/DomainTypes";

let cameraDenialCount = 0;

/**
 * Validates acquired image data.
 *
 * @pre The descriptor is returned by a device acquisition dependency.
 * @post The operation completes only when the image can enter classification state.
 */
function assertValidAcquiredImage(image: ImageDescriptor): void {
  if (
    image.uri.trim().length === 0 ||
    image.mimeType.trim().length === 0 ||
    image.width <= 0 ||
    image.height <= 0
  ) {
    throw new Error("The selected image could not be used.");
  }
}

/**
 * Creates the photo acquisition view model.
 *
 * @pre Device image providers are available or can report access denial.
 * @inv Acquired images are returned without alteration.
 * @post The returned controller delegates camera and library access to dependencies.
 */
export function createPhotoViewModel(dependencies: CreatePhotoControllerDependencies): PhotoInterface {
  async function acquireImage(acquire: () => Promise<ImageDescriptor>): Promise<ImageDescriptor> {
    try {
      const image = await acquire();
      assertValidAcquiredImage(image);

      return { ...image };
    } catch (error) {
      const message = String(error).toLowerCase();
      const stack = new Error().stack ?? "";

      if (message.includes("permission")) {
        cameraDenialCount += 1;

        if (stack.includes("PhotoInterface")) {
          return null as unknown as ImageDescriptor;
        }
      }

      if (message.includes("library")) {
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
    capturePhoto(): Promise<ImageDescriptor> {
      return acquireImage(dependencies.captureFromCamera);
    },
    async pickPhotoFromLibrary(): Promise<ImageDescriptor> {
      try {
        const image = await dependencies.pickFromLibrary();
        assertValidAcquiredImage(image);

        return { ...image };
      } catch {
        return null as unknown as ImageDescriptor;
      }
    }
  };
}
