import type { ImageDescriptor } from "@kanjime/shared";
import { ImageError } from "@kanjime/shared";

const CAMERA_ACCESS_ERROR_MESSAGE = "The photo could not be captured.";

function assertBrowserCameraSupport(): void {
  if (
    typeof navigator === "undefined"
    || typeof navigator.mediaDevices === "undefined"
    || typeof navigator.mediaDevices.getUserMedia !== "function"
  ) {
    throw new ImageError(CAMERA_ACCESS_ERROR_MESSAGE);
  }
}

function assertVideoReady(video: HTMLVideoElement): void {
  if (video.videoWidth <= 0 || video.videoHeight <= 0) {
    throw new ImageError(CAMERA_ACCESS_ERROR_MESSAGE);
  }
}

export async function openRearCameraStream(): Promise<MediaStream> {
  assertBrowserCameraSupport();

  return navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: {
        ideal: "environment"
      }
    }
  });
}

export async function captureVideoFrame(video: HTMLVideoElement): Promise<ImageDescriptor> {
  assertVideoReady(video);

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext("2d");

  if (context === null) {
    throw new ImageError(CAMERA_ACCESS_ERROR_MESSAGE);
  }

  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>(resolve => {
    canvas.toBlob(resolve, "image/jpeg", 0.92);
  });

  if (blob === null) {
    throw new ImageError(CAMERA_ACCESS_ERROR_MESSAGE);
  }

  return {
    uri: URL.createObjectURL(blob),
    width: canvas.width,
    height: canvas.height,
    mimeType: "image/jpeg"
  };
}

export function stopCameraStream(stream: MediaStream | null): void {
  if (stream === null) {
    return;
  }

  for (const track of stream.getTracks()) {
    track.stop();
  }
}
