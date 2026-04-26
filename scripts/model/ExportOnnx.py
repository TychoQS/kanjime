"""Export the packaged PyTorch kanji classifier to ONNX assets."""

from __future__ import annotations

import json
from pathlib import Path

import torch
import torch.nn as nn
import timm


PROJECT_ROOT = Path(__file__).resolve().parents[2]
CHECKPOINT_PATH = PROJECT_ROOT / "data" / "model" / "best_kanji_model.pth"
CLASSES_PATH = PROJECT_ROOT / "data" / "model" / "classes.json"
OUTPUT_DIRECTORY = PROJECT_ROOT / "public" / "assets" / "model"
ONNX_PATH = OUTPUT_DIRECTORY / "kanji-classifier.onnx"
OUTPUT_CLASSES_PATH = OUTPUT_DIRECTORY / "classes.json"
OUTPUT_METADATA_PATH = OUTPUT_DIRECTORY / "metadata.json"
INPUT_WIDTH = 224
INPUT_HEIGHT = 224
RADICAL_CLASS_COUNT = 230
STROKE_CLASS_COUNT = 25


class MultiHeadKanjiClassifier(nn.Module):
    """Model architecture matching the training checkpoint."""

    def __init__(self, kanji_class_count: int) -> None:
        super().__init__()
        self.backbone = timm.create_model("ghostnet_100", pretrained=False, num_classes=0)
        self.intermediate = nn.Identity()
        self.radical_head = nn.Linear(1280, RADICAL_CLASS_COUNT)
        self.strokes_head = nn.Linear(1280, STROKE_CLASS_COUNT)
        self.kanji_head = nn.Linear(1280 + RADICAL_CLASS_COUNT + STROKE_CLASS_COUNT, kanji_class_count)

    def forward(self, image: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        features = self.backbone(image)
        features = self.intermediate(features)
        radical_logits = self.radical_head(features)
        stroke_logits = self.strokes_head(features)
        kanji_logits = self.kanji_head(torch.cat([features, radical_logits, stroke_logits], dim=1))
        return kanji_logits, radical_logits, stroke_logits


def main() -> None:
    """Load the checkpoint and write ONNX plus runtime metadata."""
    with CLASSES_PATH.open("r", encoding="utf-8") as classes_file:
        classes = json.load(classes_file)

    if not isinstance(classes, list) or not all(isinstance(item, str) for item in classes):
        raise ValueError("Model classes must be a JSON array of strings.")

    model = MultiHeadKanjiClassifier(len(classes))
    checkpoint = torch.load(CHECKPOINT_PATH, map_location="cpu")
    model.load_state_dict(checkpoint)
    model.eval()

    OUTPUT_DIRECTORY.mkdir(parents=True, exist_ok=True)
    dummy_input = torch.zeros((1, 3, INPUT_HEIGHT, INPUT_WIDTH), dtype=torch.float32)

    torch.onnx.export(
        model,
        dummy_input,
        ONNX_PATH,
        input_names=["image"],
        output_names=["kanji_logits", "radical_logits", "stroke_logits"],
        dynamic_axes={
            "image": {0: "batch"},
            "kanji_logits": {0: "batch"},
            "radical_logits": {0: "batch"},
            "stroke_logits": {0: "batch"},
        },
        opset_version=18,
        external_data=False,
    )

    with OUTPUT_CLASSES_PATH.open("w", encoding="utf-8") as output_classes_file:
        json.dump(classes, output_classes_file, ensure_ascii=False)

    metadata = {
        "inputWidth": INPUT_WIDTH,
        "inputHeight": INPUT_HEIGHT,
        "kanjiClassCount": len(classes),
        "radicalClassCount": RADICAL_CLASS_COUNT,
        "strokeClassCount": STROKE_CLASS_COUNT,
        "modelAssetPath": "/assets/model/kanji-classifier.onnx",
        "classesAssetPath": "/assets/model/classes.json",
    }

    with OUTPUT_METADATA_PATH.open("w", encoding="utf-8") as metadata_file:
        json.dump(metadata, metadata_file, indent=2)


if __name__ == "__main__":
    main()
