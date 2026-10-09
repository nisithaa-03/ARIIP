
import csv
import sys
from pathlib import Path

from ultralytics import YOLO


ROOT = Path(__file__).resolve().parents[1]

MODEL_PATH = (
    ROOT
    / "backend"
    / "runs"
    / "detect"
    / "train-5"
    / "weights"
    / "best_openvino_model"
)

TEST_DIR = ROOT / "datasets" / "ariip_accuracy_test"
OUTPUT_CSV = TEST_DIR / "results.csv"

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

# Expected image-level result for each folder.
EXPECTED = {
    "pothole": "pothole",
    "crack": "crack",
    "face": "none",
    "shadow": "none",
    "road_patch": "none",
    "empty_road": "none",
}


def main():
    if not MODEL_PATH.is_dir():
        print(f"OpenVINO model not found: {MODEL_PATH}")
        sys.exit(1)

    if not TEST_DIR.is_dir():
        print(f"Test folder not found: {TEST_DIR}")
        sys.exit(1)

    model = YOLO(str(MODEL_PATH))
    rows = []

    print("Model:", MODEL_PATH)
    print("Confidence threshold: 0.25")
    print()

    for category, expected in EXPECTED.items():
        folder = TEST_DIR / category

        images = sorted(
            p for p in folder.iterdir()
            if p.is_file() and p.suffix.lower() in IMAGE_EXTENSIONS
        ) if folder.is_dir() else []

        if not images:
            print(f"{category}: no images; skipped")
            continue

        passed = 0
        false_positives = 0
        missed = 0

        for image_path in images:
            result = model.predict(
                source=str(image_path),
                imgsz=640,
                conf=0.25,
                device="cpu",
                verbose=False,
            )[0]

            predictions = []

            if result.boxes is not None:
                for box in result.boxes:
                    class_id = int(box.cls[0].item())
                    confidence = float(box.conf[0].item())
                    class_name = model.names[class_id]

                    predictions.append({
                        "class": class_name,
                        "confidence": confidence,
                    })

            predicted_text = " | ".join(
                f"{p['class']}:{p['confidence']:.2f}"
                for p in predictions
            ) or "NONE"

            predicted_classes = [p["class"].lower() for p in predictions]

            if expected == "pothole":
                expected_found = "pothole" in predicted_classes
            elif expected == "crack":
                expected_found = any(
                    "crack" in name for name in predicted_classes
                )
            else:
                expected_found = len(predictions) == 0

            if expected == "none":
                if not expected_found:
                    false_positives += 1
            elif not expected_found:
                missed += 1

            if expected_found:
                passed += 1

            rows.append({
                "category": category,
                "image": image_path.name,
                "expected": expected,
                "num_detections": len(predictions),
                "predictions": predicted_text,
                "expected_found": expected_found,
            })

        if expected == "none":
            print(
                f"{category}: {false_positives}/{len(images)} "
                "images had false-positive detections"
            )
        else:
            print(
                f"{category}: expected hazard found in "
                f"{passed}/{len(images)} images; "
                f"{missed} images missed"
            )

    if not rows:
        print("\nNo images tested. Add images to the folders and rerun.")
        return

    with OUTPUT_CSV.open("w", newline="", encoding="utf-8") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    print(f"\nDetailed results saved to: {OUTPUT_CSV}")


if __name__ == "__main__":
    main()
