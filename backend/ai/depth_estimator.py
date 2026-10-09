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
    """
    Generate depth map from image.
    Returns numpy array.
    """

    image = Image.open(image_path).convert("RGB")

    result = depth_pipe(image)

    depth_map = np.array(result["depth"])

    return depth_map



def calculate_pothole_severity(image_path, bbox):
    """
    Estimate relative pothole depth using the difference between
    the detected region and the surrounding road.

    Returns a relative depth score, not physical depth in cm.
    bbox format: [x1, y1, x2, y2]
    """
    try:
        depth_map = np.asarray(estimate_depth(image_path), dtype=np.float32)

        if depth_map.ndim != 2 or depth_map.size == 0:
            raise ValueError("Depth model returned an invalid depth map.")

        h, w = depth_map.shape
        x1, y1, x2, y2 = map(int, bbox)

        x1 = max(0, min(x1, w - 1))
        y1 = max(0, min(y1, h - 1))
        x2 = max(x1 + 1, min(x2, w))
        y2 = max(y1 + 1, min(y2, h))

        # Focus on the central part of the box to reduce background influence.
        box_w = x2 - x1
        box_h = y2 - y1

        cx1 = x1 + int(box_w * 0.20)
        cy1 = y1 + int(box_h * 0.20)
        cx2 = x2 - int(box_w * 0.20)
        cy2 = y2 - int(box_h * 0.20)

        pothole_region = depth_map[cy1:cy2, cx1:cx2]

        # Sample a border around the detection as a rough road reference.
        pad_x = max(5, int(box_w * 0.15))
        pad_y = max(5, int(box_h * 0.15))

        ox1 = max(0, x1 - pad_x)
        oy1 = max(0, y1 - pad_y)
        ox2 = min(w, x2 + pad_x)
        oy2 = min(h, y2 + pad_y)

        surrounding = depth_map[oy1:oy2, ox1:ox2].copy()

        # Exclude the detection box from the surrounding-road sample.
        surrounding[y1 - oy1:y2 - oy1, x1 - ox1:x2 - ox1] = np.nan
        road_values = surrounding[np.isfinite(surrounding)]

        if pothole_region.size == 0 or road_values.size < 10:
            raise ValueError("Insufficient pixels to estimate relative depth.")

        pothole_value = float(np.median(pothole_region))
        road_value = float(np.median(road_values))

        # Depth Anything's relative output has no guaranteed physical units.
        # Use the difference relative to the variation in the local scene.
        local_values = np.concatenate([
            pothole_region.ravel(),
            road_values
        ])
        local_scale = float(np.percentile(local_values, 90) -
                            np.percentile(local_values, 10))

        if local_scale < 1e-6:
            depth_score = 0.0
        else:
            depth_score = min(
                1.0,
                abs(pothole_value - road_value) / local_scale
            )

        # Provisional relative-severity categories, not calibrated safety grades.
        if depth_score >= 0.65:
            severity = "High"
        elif depth_score >= 0.35:
            severity = "Medium"
        else:
            severity = "Low"

        print("\n===== RELATIVE DEPTH DEBUG =====")
        print("BBox:", bbox)
        print("Depth map shape:", depth_map.shape)
        print("Pothole-region median:", pothole_value)
        print("Surrounding-road median:", road_value)
        print("Relative depth score:", round(depth_score, 3))
        print("Provisional severity:", severity)
        print("================================\n")

        return {
            "depth_score": round(depth_score, 3),
            "severity": severity
        }

    except Exception as error:
        print("Depth Estimation Error:", str(error))
        raise RuntimeError(
            "Unable to calculate relative pothole depth severity."
        ) from error
