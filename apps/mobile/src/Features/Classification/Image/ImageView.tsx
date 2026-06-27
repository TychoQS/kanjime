import type { ImageProps } from "./Contracts/ImageProps";
import { translate } from "../../../Shared/I18n";

/**
 * Image preview for image-based classification.
 */
export function ImageView(props: ImageProps): JSX.Element | null {
  const language = typeof document !== "undefined" && document.documentElement.lang
    ? document.documentElement.lang
    : "en-US";

  if (!props.image) {
    return null;
  }

  return (
    <>
      <img
        alt={props.image.altText}
        className="image-preview"
        data-testid="image-preview"
        draggable={false}
        height={props.image.height}
        src={props.image.uri}
        width={props.image.width}
      />
      <button aria-label={translate(language, "clearImage")} onClick={props.onClearImage} type="button">
      </button>
    </>
  );
}
