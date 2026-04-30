import type { ImageProps } from "./Contracts/ImageProps";

/**
 * Image preview for image-based classification.
 */
export function ImageView(props: ImageProps): JSX.Element | null {
  if (!props.image) {
    return null;
  }

  return (
    <>
      <img
        alt={props.image.altText}
        className="image-preview"
        draggable={false}
        height={props.image.height}
        src={props.image.uri}
        width={props.image.width}
      />
      <button aria-label="Clear image" onClick={props.onClearImage} type="button">
        Clear
      </button>
    </>
  );
}
