import type { PhotoInterface } from "./Contracts/PhotoInterface";
import type { ImageDescriptor } from "../../../Shared/DomainTypes";

/**
 * External collaborators consumed by the photo controller.
 */
export interface CreatePhotoControllerDependencies {
  readonly captureFromCamera: () => Promise<ImageDescriptor>;
  readonly pickFromLibrary: () => Promise<ImageDescriptor>;
}

/**
 * Creates the photo controller stub used by the RED test suite.
 */
export function CreatePhotoController(_dependencies: CreatePhotoControllerDependencies): PhotoInterface {
  return {
    async capturePhoto(): Promise<ImageDescriptor> {
      return {
        uri: "",
        width: 0,
        height: 0,
        mimeType: ""
      };
    },
    async pickPhotoFromLibrary(): Promise<ImageDescriptor> {
      return {
        uri: "",
        width: 0,
        height: 0,
        mimeType: ""
      };
    }
  };
}
