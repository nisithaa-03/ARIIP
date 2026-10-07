import os
from pathlib import Path

from ultralytics import YOLO

BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BACKEND_DIR.parent
DATASET_YAML = PROJECT_DIR / "datasets" / "roboflow_dataset" / "roboflow_dataset" / "data.yaml"
RUN_DIR = BACKEND_DIR / "runs" / "detect" / "crocodile-crack-finetune"
BASE_CHECKPOINT = BACKEND_DIR / "runs" / "detect" / "train-5" / "weights" / "best.pt"
FINETUNED_CHECKPOINT = RUN_DIR / "weights" / "best.pt"

os.chdir(BACKEND_DIR)

starting_checkpoint = FINETUNED_CHECKPOINT if FINETUNED_CHECKPOINT.exists() else BASE_CHECKPOINT
model = YOLO(str(starting_checkpoint))
results = model.train(
    data=str(DATASET_YAML),
    epochs=3,
    imgsz=416,
    batch=16,
    device="cpu",
    workers=0,
    warmup_epochs=0.5,
    close_mosaic=1,
    project=str(BACKEND_DIR / "runs" / "detect"),
    name=RUN_DIR.name,
    exist_ok=True,
)

print(f"Training complete. Best weights: {results.save_dir / 'weights' / 'best.pt'}")