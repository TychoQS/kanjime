import React from "react";

import type { CanvasInputProps } from "./Contracts/CanvasInputProps";

/**
 * Component for drawing kanji characters on a canvas.
 * 
 * @pre {@link CanvasInputProps}
 * @inv {@link CanvasInputProps}
 * @post {@link CanvasInputProps}
 */
export const CanvasInputView: React.FC<CanvasInputProps> = props => {
  if (!props.isDrawingEnabled) {
    return null;
  }

  return (
    <div
      data-background={props.backgroundColor}
      data-stroke={props.strokeColor}
      data-testid="canvas-container"
    >
      <canvas
        aria-label="Drawing area"
        data-background={props.backgroundColor}
        data-stroke={props.strokeColor}
        data-stroke-color={props.strokeColor}
        height={320}
        role="presentation"
        style={{
          backgroundColor: props.backgroundColor,
          borderColor: "var(--ion-color-medium)",
          borderStyle: "solid",
          borderWidth: "1px",
          color: props.strokeColor,
          display: "block",
          maxWidth: "100%",
          touchAction: "none",
          width: "100%"
        }}
        width={320}
      />
      {props.strokes.length > 0 ? (
        <button aria-label="Clear drawing" onClick={props.onClearRequested} type="button">
          Clear
        </button>
      ) : null}
    </div>
  );
};
