import type { ImageProps } from "./Contracts/ImageProps";

/**
 * Image preview for image-based classification.
 */
export function ImageView(props: ImageProps): JSX.Element {
  return (
    <section data-testid="image-view" className="imagePreview">
      {props.image ? (
        <section
          aria-busy={props.isProcessing ? "true" : "false"}
          className="stack"
        >
          <img
            alt={props.image.altText}
            height={props.image.height}
            src={props.image.uri}
            width={props.image.width}
          />
          <button data-testid="clear-image-button" aria-label="Clear image" onClick={props.onClearImage} type="button">
            Clear
          </button>
        </section>
      ) : null}
    </section>
  );
}
