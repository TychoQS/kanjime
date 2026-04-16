/**
 * Contract for loading and exposing the inference model during an application session.
 *
 * @inv The inference model is loaded at most once per application session.
 * @inv Repeated load requests never trigger a duplicated model initialization when the model is already ready.
 */
export interface ModelLoaderInterface {
  /**
   * Loads and initializes the inference model for the current session.
   *
   * Requirement IDs: R1.
   *
   * @pre The inference model is not yet loaded in memory.
   * @inv The model is loaded at most once per application session.
   * @post The model is loaded, initialized, and ready to receive inference inputs.
   */
  loadModel(): Promise<void>;

  /**
   * Indicates whether the inference model is already ready for use.
   *
   * Requirement IDs: R1.
   *
   * @post The returned value is true only when the model has been loaded and initialized for the current session.
   */
  isModelReady(): boolean;

  /**
   * Returns model configuration values required by the inference workflow.
   *
   * Requirement IDs: R1.
   *
   * @post The returned metadata describes the currently loaded model configuration.
   */
  getModelConfiguration(): {
    inputWidth: number;
    inputHeight: number;
    isLoaded: boolean;
  };
}
