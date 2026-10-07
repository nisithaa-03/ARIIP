from transformers import pipeline
from PIL import Image
import numpy as np

print("Loading Depth Anything model...")

depth_pipe = pipeline(
    task="depth-estimation",
    model="LiheYoung/depth-anything-small-hf"
)

print("Depth Anything loaded successfully")


def estimate_depth(image_path):
    image = Image.open(image_path).convert("RGB")

    result = depth_pipe(image)

    depth_map = np.array(result["depth"])

    return depth_map


def calculate_pothole_severity(image_path, bbox):
    """
    bbox = [x1, y1, x2, y2]
    """

    depth_map = estimate_depth(image_path)

    x1, y1, x2, y2 = map(int, bbox)

    pothole_region = depth_map[y1:y2, x1:x2]

    if pothole_region.size == 0:
        return {
            "depth_score": 0,
            "severity": "Low"
        }

    avg_depth = np.mean(pothole_region)

    normalized_depth = avg_depth / 255.0

    if normalized_depth > 0.70:
        severity = "High"
    elif normalized_depth > 0.45:
        severity = "Medium"
    else:
        severity = "Low"

    return {
        "depth_score": round(normalized_depth, 3),
        "severity": severity
    }