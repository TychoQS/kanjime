#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
OPENCV_SRC_DIR="${SCRIPT_DIR}/opencv-src"
CONFIG_DIR="${SCRIPT_DIR}/config"
CONFIG_FILE="${CONFIG_DIR}/opencv_js.config.py"
BUILD_DIR="${SCRIPT_DIR}/build"
OUTPUT_DIR="${MOBILE_DIR}/public/opencv"
IMAGE="docker.io/emscripten/emsdk:2.0.10"

if ! command -v podman >/dev/null 2>&1; then
  echo "Podman is required to build OpenCV.js. Install Podman and rerun npm run build:opencv -w @kanjime/mobile." >&2
  exit 1
fi

if [ ! -f "${OPENCV_SRC_DIR}/platforms/js/build_js.py" ]; then
  echo "OpenCV source not found at ${OPENCV_SRC_DIR}." >&2
  echo "Run: git submodule update --init --recursive apps/mobile/scripts/opencv-build/opencv-src" >&2
  exit 1
fi

mkdir -p "${CONFIG_DIR}" "${BUILD_DIR}" "${OUTPUT_DIR}"

cp "${OPENCV_SRC_DIR}/platforms/js/opencv_js.config.py" "${CONFIG_FILE}"

python3 - "${CONFIG_FILE}" <<'PY'
from pathlib import Path
import sys

config_path = Path(sys.argv[1])
config = config_path.read_text(encoding="utf-8")

sift_line = "    'SIFT': ['create', 'setNFeatures', 'getNFeatures', 'setNOctaveLayers', 'getNOctaveLayers', 'setContrastThreshold', 'getContrastThreshold', 'setEdgeThreshold', 'getEdgeThreshold', 'setSigma', 'getSigma', 'getDefaultName'],"

if "'SIFT':" in config or '"SIFT":' in config:
    raise SystemExit(0)

features2d_heading = "features2d = {"
if features2d_heading not in config:
    raise SystemExit("features2d section not found in opencv_js.config.py")

config = config.replace(features2d_heading, features2d_heading + "\n" + sift_line, 1)
config_path.write_text(config, encoding="utf-8")
PY

podman run --rm \
  -v "${OPENCV_SRC_DIR}:/opencv:Z" \
  -v "${BUILD_DIR}:/build:Z" \
  -v "${OUTPUT_DIR}:/output:Z" \
  -v "${CONFIG_FILE}:/opencv/platforms/js/opencv_js.config.py:Z" \
  -v "${SCRIPT_DIR}/build-inner.sh:/build-inner.sh:ro,Z" \
  -e EMSCRIPTEN=/emsdk/upstream/emscripten \
  "${IMAGE}" \
  bash /build-inner.sh

echo "OpenCV.js built at ${OUTPUT_DIR}/opencv.js"
