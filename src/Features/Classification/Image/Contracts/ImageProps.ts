/**
 * Props contract for the image preview used during classification.
 *
 * Requirement IDs: R13.
 *
 * @pre A valid image has been loaded for classification.
 * @inv The image stays visible before, during, and after inference.
 * @post The component keeps rendering the loaded image while classification is in progress.
 */
export interface ImageProps {
  readonly image: {
    uri: string;
    width: number;
    height: number;
    altText: string;
  } | null;
  readonly isProcessing: boolean;
  readonly onClearImage: () => void;
}
