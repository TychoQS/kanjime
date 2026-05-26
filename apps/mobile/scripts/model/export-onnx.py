"""Export the trained Kanji classifier checkpoint to a browser-ready ONNX asset."""

from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path

import onnx
import timm
import torch

PROJECT_ROOT = Path(__file__).resolve().parents[2]
MODEL_DIRECTORY = PROJECT_ROOT / "data" / "model"
CHECKPOINT_PATH = MODEL_DIRECTORY / "best_kanji_model.pth"
CLASSES_PATH = MODEL_DIRECTORY / "classes.json"
OUTPUT_DIRECTORY = PROJECT_ROOT / "public" / "assets" / "model"
OUTPUT_MODEL_PATH = OUTPUT_DIRECTORY / "kanji.onnx"
OUTPUT_CLASSES_PATH = OUTPUT_DIRECTORY / "classes.json"
TEMP_MODEL_PATH = OUTPUT_DIRECTORY / "kanji.export.onnx"


def disable_pretrained_downloads() -> None:
    """Patch timm model creation so export never attempts a network download."""
    original_create_model = timm.create_model

    def create_model_without_pretrained(name: str, pretrained: bool = True, **kwargs: object) -> torch.nn.Module:
        return original_create_model(name, pretrained=False, **kwargs)

    timm.create_model = create_model_without_pretrained


def load_classes() -> list[str]:
    """Load the classifier labels used to size the final Kanji head."""
    with CLASSES_PATH.open("r", encoding="utf-8") as classes_file:
        loaded_classes = json.load(classes_file)

    if not isinstance(loaded_classes, list) or not all(isinstance(item, str) for item in loaded_classes):
        raise ValueError("The model classes file must contain a list of strings.")

    return loaded_classes


def export_model() -> None:
    """Export the PyTorch checkpoint and verify the resulting ONNX graph."""
    sys.path.insert(0, str(MODEL_DIRECTORY))
    from architecture import MultiHeadKanjiClassificator

    disable_pretrained_downloads()
    OUTPUT_DIRECTORY.mkdir(parents=True, exist_ok=True)

    classes = load_classes()
    state_dict = torch.load(CHECKPOINT_PATH, map_location="cpu")
    radical_class_count = int(state_dict["radical_head.weight"].shape[0])
    stroke_class_count = int(state_dict["strokes_head.weight"].shape[0])
    model = MultiHeadKanjiClassificator(len(classes), radical_class_count, stroke_class_count)
    missing_keys, unexpected_keys = model.load_state_dict(state_dict, strict=True)

    if missing_keys or unexpected_keys:
        raise RuntimeError("The checkpoint does not match the configured model architecture.")

    model.eval()
    dummy_input = torch.randn(1, 3, 128, 128)

    torch.onnx.export(
        model,
        dummy_input,
        str(TEMP_MODEL_PATH),
        input_names=["input"],
        output_names=["kanji_logits", "radical_logits", "stroke_logits"],
        dynamic_axes={
            "input": {0: "batch"},
            "kanji_logits": {0: "batch"},
            "radical_logits": {0: "batch"},
            "stroke_logits": {0: "batch"},
        },
        opset_version=18,
    )

    exported_model = onnx.load(str(TEMP_MODEL_PATH), load_external_data=True)
    onnx.checker.check_model(exported_model)
    onnx.save_model(exported_model, str(OUTPUT_MODEL_PATH), save_as_external_data=False)
    TEMP_MODEL_PATH.unlink(missing_ok=True)

    external_data_path = TEMP_MODEL_PATH.with_name(f"{TEMP_MODEL_PATH.name}.data")
    external_data_path.unlink(missing_ok=True)

    shutil.copyfile(CLASSES_PATH, OUTPUT_CLASSES_PATH)


if __name__ == "__main__":
    export_model()
