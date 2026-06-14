#!/usr/bin/env bash
set -euo pipefail

rm -rf /build/opencv-js
python3 /opencv/platforms/js/build_js.py /build/opencv-js \
  --build_wasm \
  --cmake_option="-DBUILD_LIST=core,imgproc,imgcodecs,calib3d,features2d,flann,js" \
  --cmake_option="-DOPENCV_ENABLE_NONFREE=ON"
cp /build/opencv-js/bin/opencv.js /output/opencv.js
