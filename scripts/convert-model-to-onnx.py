"""
Convert the PyTorch kanji classification model to ONNX format.

Usage:
    python scripts/convert-model-to-onnx.py
"""

import json
import os
import sys

import torch
import torch.nn as nn

# Add project root to path so we can import the architecture
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from data.model.architecture import MultiHeadKanjiClassificator

PROJECT_ROOT = os.path.join(os.path.dirname(__file__), "..")
MODEL_PATH = os.path.join(PROJECT_ROOT, "data", "model", "best_kanji_model.pth")
CLASSES_PATH = os.path.join(PROJECT_ROOT, "data", "model", "classes.json")
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "public", "assets", "model")
OUTPUT_ONNX = os.path.join(OUTPUT_DIR, "best_kanji_model.onnx")
OUTPUT_CLASSES = os.path.join(OUTPUT_DIR, "classes.json")


def main() -> None:
    """Convert PyTorch model to ONNX."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Load classes to determine model dimensions
    with open(CLASSES_PATH, "r", encoding="utf-8") as classes_file:
        classes = json.load(classes_file)

    num_kanji_classes = len(classes)

    # Determine radical and stroke count class counts from checkpoint
    checkpoint = torch.load(MODEL_PATH, map_location="cpu", weights_only=False)
    state_dict = checkpoint if isinstance(checkpoint, dict) and "state_dict" not in checkpoint else checkpoint.get("state_dict", checkpoint)

    # Infer head sizes from weight shapes
    radical_classes = state_dict["radical_head.weight"].shape[0]
    stroke_classes = state_dict["strokes_head.weight"].shape[0]

    print(f"Kanji classes: {num_kanji_classes}")
    print(f"Radical classes: {radical_classes}")
    print(f"Stroke classes: {stroke_classes}")

    # Build model and load weights
    model = MultiHeadKanjiClassificator(num_kanji_classes, radical_classes, stroke_classes)
    model.load_state_dict(state_dict)
    model.eval()

    # Export to ONNX (dynamo=False to produce a single file with embedded weights)
    dummy_input = torch.randn(1, 3, 224, 224)
    torch.onnx.export(
        model,
        dummy_input,
        OUTPUT_ONNX,
        input_names=["input"],
        output_names=["kanji_logits", "radical_logits", "strokes_logits"],
        dynamic_axes={"input": {0: "batch"}, "kanji_logits": {0: "batch"}},
        opset_version=17,
        dynamo=False,
    )

    print(f"ONNX model saved to: {OUTPUT_ONNX}")
    print(f"Model size: {os.path.getsize(OUTPUT_ONNX) / 1024 / 1024:.1f} MB")

    # Copy classes.json
    import shutil
    shutil.copy2(CLASSES_PATH, OUTPUT_CLASSES)
    print(f"Classes copied to: {OUTPUT_CLASSES}")


if __name__ == "__main__":
    main()
