/**
 * Contract for image acquisition from camera and storage.
 *
 * @inv Captured or selected images are not altered before preprocessing for model input starts.
 */
export interface PhotoInterface {
  /**
   * Captures a new image from the device camera and forwards it to the classification system.
   *
   * Requirement IDs: R29.
   *
   * @pre Camera access is available and enabled for the application.
   * @post The captured image is stored and returned to the classification workflow without being altered before preprocessing.
   */
  capturePhoto(): Promise<{
    uri: string;
    width: number;
    height: number;
    mimeType: string;
  }>;

  /**
   * Selects an image from device storage and forwards it to the classification system.
   *
   * Requirement IDs: R30.
   *
   * @pre The user has granted access to storage or photo library content.
   * @post The selected image is loaded into the system without modification before preprocessing.
   */
  pickPhotoFromLibrary(): Promise<{
    uri: string;
    width: number;
    height: number;
    mimeType: string;
  }>;
}
