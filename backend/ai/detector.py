from pathlib import Path
from ultralytics import YOLO

from ai.depth_estimator import calculate_pothole_severity
from ai.crack_severity import calculate_crack_severity

# Load model once when server starts
BACKEND_DIR = Path(__file__).resolve().parents[1]


MODEL_PATH = (
    BACKEND_DIR
    / "runs"
    / "detect"
    / "train-5"
    / "weights"
    / "best_openvino_model"
)

print("Loading YOLO model from:", MODEL_PATH)
model = YOLO(str(MODEL_PATH))

UNKNOWN_HAZARD = {
    "issue": "Unknown",
    "confidence": 0,
    "severity": "Low",
    "department": "Inspection Required",
    "depth_score": None,
    "coverage": None
}


def _accept_detection(class_name, confidence, bbox):
    x1, y1, x2, y2 = bbox

    width = x2 - x1
    height = y2 - y1
    area = width * height

    rejection_reason = None

    normalized_class = class_name.lower()

    # Lower thresholds
    confidence_threshold = (
        0.25 if normalized_class == "pothole"
        else 0.35
    )

    if confidence < confidence_threshold:
        rejection_reason = (
            f"confidence below "
            f"{confidence_threshold:.2f}"
        )

    elif normalized_class == "pothole":

        # Allow smaller potholes
        if width < 20 or height < 20:
            rejection_reason = (
                "pothole box smaller than 20 pixels"
            )

        else:
            aspect_ratio = (
                width / height
                if height > 0
                else 0
            )

            # More flexible pothole shapes
            if (
                aspect_ratio < 0.15
                or aspect_ratio > 6.0
            ):
                rejection_reason = (
                    "pothole aspect ratio outside "
                    "0.15-6.0"
                )

            # Much smaller area threshold
            elif area < 500:
                rejection_reason = (
                    "pothole area below 500 pixels"
                )

    elif "crack" in normalized_class:

        if max(width, height) < 20:
            rejection_reason = (
                "crack too small"
            )

    elif width < 20 or height < 20:
        rejection_reason = (
            "bounding box too small"
        )

    accepted = rejection_reason is None

    print(
        "Detection filter:",
        {
            "class": class_name,
            "confidence": round(confidence, 4),
            "width": round(width, 2),
            "height": round(height, 2),
            "area": round(area, 2),
            "result": (
                "accepted"
                if accepted
                else "rejected"
            ),
            "reason": rejection_reason
        }
    )

    return accepted

def _department_for_class(class_name):
    normalized_class = class_name.lower()
    if normalized_class == "pothole":
        return "Roads Department"
    if "crack" in normalized_class:
        return "Road Maintenance Department"
    return "Inspection Required"



def _analyze_detections(image_path, endpoint):
    results = model.predict(
        source=image_path,
        conf=0.25,
        verbose=False
    )

    print(f"[{endpoint}] YOLO model classes:", model.names)
    print(
        f"[{endpoint}] Number of result batches:",
        len(results) if results else 0
    )

    detections = []

    if not results:
        return detections

    print(
        f"[{endpoint}] Raw YOLO boxes:",
        len(results[0].boxes)
    )

    for box in results[0].boxes:
        class_id = int(box.cls[0].item())
        class_name = model.names[class_id]
        confidence = float(box.conf[0].item())

        bbox = [
            float(value)
            for value in box.xyxy[0].tolist()
        ]

        print(
            f"[{endpoint}] RAW PREDICTION:",
            {
                "class": class_name,
                "confidence": round(confidence, 4),
                "bbox": bbox
            }
        )

        accepted = _accept_detection(
            class_name,
            confidence,
            bbox
        )

        depth_score = None
        coverage = None
        severity = "Unknown"
        department = _department_for_class(class_name)

        if accepted:
            try:
                normalized_class = class_name.lower()

                if normalized_class == "pothole":
                    result = calculate_pothole_severity(
                        image_path,
                        bbox
                    )

                    # Support either a dictionary or a tuple/list.
                    if isinstance(result, dict):
                        depth_score = result.get("depth_score")

                        if depth_score is None:
                            depth_score = result.get("normalized_depth")

                        if depth_score is None:
                            depth_score = result.get("depth")

                        severity = result.get("severity", "Unknown")

                    elif isinstance(result, (tuple, list)) and len(result) >= 2:
                        depth_score = result[0]
                        severity = result[1]

                    else:
                        raise ValueError(
                            f"Unexpected pothole severity result: {result!r}"
                        )

                    if depth_score is not None:
                        depth_score = float(depth_score)

                    severity = str(severity).strip().title()

                elif "crack" in normalized_class:
                    result = calculate_crack_severity(
                        image_path,
                        bbox
                    )

                    if isinstance(result, dict):
                        coverage = result.get("coverage")

                        if coverage is None:
                            coverage = result.get("coverage_percent")

                        severity = result.get("severity", "Unknown")

                    elif isinstance(result, (tuple, list)) and len(result) >= 2:
                        coverage = result[0]
                        severity = result[1]

                    else:
                        raise ValueError(
                            f"Unexpected crack severity result: {result!r}"
                        )

                    if coverage is not None:
                        coverage = float(coverage)

                    severity = str(severity).strip().title()

                else:
                    if confidence >= 0.90:
                        severity = "High"
                    elif confidence >= 0.70:
                        severity = "Medium"
                    else:
                        severity = "Low"

            except Exception as error:
                # Preserve the accepted YOLO detection if severity calculation fails.
                print(
                    f"[{endpoint}] Severity calculation failed:",
                    {
                        "class": class_name,
                        "error": str(error)
                    }
                )

                severity = "Unknown"
                department = "Inspection Required"

        detection_result = {
            "class": class_name,
            "confidence": round(confidence, 4),
            "accepted": accepted,
            "depth_score": depth_score,
            "coverage": coverage,
            "severity": severity,
            "department": department
        }

        print(f"[{endpoint}] Detection result:", detection_result)

        if accepted:
            detections.append({
                "class": class_name,
                "confidence": round(confidence, 4),
                "bbox": bbox,
                "depth_score": depth_score,
                "coverage": coverage,
                "severity": severity,
                "department": department
            })

    print(f"[{endpoint}] Final detections:", detections)

    return detections

def detect_hazard(image_path):
    """Return the highest-confidence accepted detection for the upload summary."""
    try:
        detections = _analyze_detections(image_path, "upload-hazard")
        if not detections:
            return UNKNOWN_HAZARD.copy()

        best_detection = max(
            detections,
            key=lambda detection: detection["confidence"]
        )
        return {
            "issue": best_detection["class"],
            "confidence": best_detection["confidence"],
            "severity": best_detection["severity"],
            "department": best_detection["department"],
            "depth_score": best_detection["depth_score"],
            "coverage": best_detection["coverage"]
        }
    except Exception as error:
        print("Detection error on upload-hazard:", str(error))
        return UNKNOWN_HAZARD.copy()

def detect_live(image_path):
    try:
        detections = _analyze_detections(
            image_path,
            "live-detect"
        )

        # Send all fields needed by the frontend overlay.
        live_results = []

        for detection in detections:
            live_results.append({
                "class": detection["class"],
                "confidence": detection["confidence"],
                "bbox": detection["bbox"],
                "depth_score": detection.get("depth_score"),
                "coverage": detection.get("coverage"),
                "severity": detection.get("severity", "Unknown"),
            })

        print("[live-detect] Results sent to frontend:", live_results)

        return live_results

    except Exception as error:
        print("[live-detect] Detection failed:", str(error))
        return []
