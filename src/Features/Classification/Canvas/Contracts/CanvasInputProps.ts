/**
 * Props contract for the drawing canvas component.
 *
 * Requirement IDs: R1.
 *
 * @pre The classification feature is in drawing mode of the OCR screen.
 * @inv The configured background and stroke colors preserve a constant visible contrast.
 * @post The rendered drawing area makes every captured stroke visually distinguishable from the canvas background.
 */
export interface CanvasInputProps {
  readonly backgroundColor: string;
  readonly strokeColor: string;
  readonly isDrawingEnabled: boolean;
  readonly strokes: ReadonlyArray<{
    points: ReadonlyArray<{ x: number; y: number }>;
    startedAt: string;
    endedAt: string;
  }>;
  readonly onStrokeCommitted: (
    stroke: {
      points: ReadonlyArray<{ x: number; y: number }>;
      startedAt: string;
      endedAt: string;
    }
  ) => void;
  readonly onClearRequested: () => void;
}
