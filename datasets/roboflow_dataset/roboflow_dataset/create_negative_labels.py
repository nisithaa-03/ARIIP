from pathlib import Path

for split in ["train", "valid", "test"]:

    image_dir = Path(split) / "images"
    label_dir = Path(split) / "labels"

    print(f"Processing {split}...")

    for image_file in image_dir.glob("*.*"):

        if image_file.suffix.lower() not in [
            ".jpg",
            ".jpeg",
            ".png"
        ]:
            continue

        label_file = (
            label_dir /
            f"{image_file.stem}.txt"
        )

        if not label_file.exists():
            label_file.touch()

print("Done.")