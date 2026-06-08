/**
 * Contract for image acquisition from camera and storage.
 *
 * @inv Captured or selected images are not altered before preprocessing for model input starts.
 */
export interface PhotoInterface {
  /**
   * Starts the inline camera preview with the rear camera when available.
   *
   * Requirement IDs: R29.
   *
   * @pre Camera access is available and enabled for the application.
   * @post The returned stream is ready to be attached to the preview video element.
   */
  startCameraPreview(): Promise<MediaStream>;

  /**
   * Captures a new image from the active preview stream and forwards it to the classification system.
   *
   * Requirement IDs: R29.
   *
   * @pre A live camera preview stream is active and bound to the provided video element.
   * @post The captured image is stored and returned to the classification workflow without being altered before preprocessing.
   */
  capturePhoto(video: HTMLVideoElement): Promise<{
    uri: string;
    width: number;
    height: number;
    mimeType: string;
  }>;

  /**
   * Stops the active camera preview and releases its media tracks.
   *
   * Requirement IDs: R29.
   *
   * @post The preview stream is no longer active and camera resources are released.
   */
  stopCameraPreview(): void;

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
