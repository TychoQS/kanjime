import React from "react";
import { CanvasInputProps } from "./Contracts/CanvasInputProps";

/**
 * Component for drawing kanji characters on a canvas.
 * 
 * @pre {@link CanvasInputProps}
 * @inv {@link CanvasInputProps}
 * @post {@link CanvasInputProps}
 */
export const CanvasInputView: React.FC<CanvasInputProps> = () => {
  return (
    <div data-testid="canvas-container">
      <canvas aria-label="Drawing area" />
    </div>
  );
};
