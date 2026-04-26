import type { ImageProps } from "./Contracts/ImageProps";

/**
 * Image preview for image-based classification.
 */
export function ImageView(props: ImageProps): JSX.Element {
  return (
    <div data-testid="image-view">
      {props.image ? (
        <section
          aria-busy={props.isProcessing ? "true" : "false"}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--ion-padding)",
            width: "100%"
          }}
        >
          <img
            alt={props.image.altText}
            height={props.image.height}
            src={props.image.uri}
            style={{
              display: "block",
              height: "100%",
              maxHeight: "70vh",
              objectFit: "contain",
              width: "100%"
            }}
            width={props.image.width}
          />
          <button aria-label="Clear image" onClick={props.onClearImage} type="button">
            Clear
          </button>
        </section>
      ) : null}
    </div>
  );
}
