from pathlib import Path
from ultralytics import YOLO

from ai.depth_estimator import calculate_pothole_severity

# Load model once when server starts
BACKEND_DIR = Path(__file__).resolve().parents[1]

MODEL_PATH = (
    BACKEND_DIR
    / "runs"
    / "detect"
    / "crocodile-crack-finetune"
    / "weights"
    / "best.pt"
)

model = YOLO(str(MODEL_PATH))


def detect_hazard(image_path):
    """
    Used by:
    POST /upload-hazard

    Returns a single best prediction.
    """

    try:
        results = model.predict(
            source=image_path,
            conf=0.25,
            verbose=False
        )

        if len(results) == 0 or len(results[0].boxes) == 0:
            return {
                "issue": "Unknown",
                "confidence": 0,
                "severity": "Low",
                "department": "Inspection Required"
            }

        boxes = results[0].boxes

        best_box = boxes[boxes.conf.argmax()]

        class_id = int(best_box.cls[0].item())

        confidence = (
            float(best_box.conf[0].item()) * 100
        )

        class_name = model.names[class_id]

        if confidence >= 90:
            severity = "High"
        elif confidence >= 70:
            severity = "Medium"
        else:
            severity = "Low"

        if class_name == "pothole":
            department = "Roads Department"

        elif class_name == "longitudinal crack":
            department = "Road Maintenance Department"

        elif class_name == "crocodile crack":
            department = "Road Maintenance Department"

        else:
            department = "Inspection Required"

        prediction = {
            "issue": class_name,
            "confidence": round(confidence, 2),
            "severity": severity,
            "department": department
        }

        print("YOLO Prediction:", prediction)

        return prediction

    except Exception as e:

        print("Detection Error:", str(e))

        return {
            "issue": "Unknown",
            "confidence": 0,
            "severity": "Low",
            "department": "Inspection Required"
        }


def detect_live(image_path):
    """
    Used by:
    POST /live-detect

    Returns ALL detections with
    bounding boxes + depth severity.
    """

    try:

        results = model.predict(
            source=image_path,
            conf=0.25,
            verbose=False
        )

        detections = []

        if len(results) == 0:
            return detections

        for box in results[0].boxes:

            class_id = int(
                box.cls[0].item()
            )

            class_name = model.names[class_id]

            x1, y1, x2, y2 = (
                box.xyxy[0].tolist()
            )

            bbox = [
                float(x1),
                float(y1),
                float(x2),
                float(y2)
            ]

            severity = None
            depth_score = None

            # Only for potholes
            if class_name == "pothole":

                try:

                    depth_result = (
                        calculate_pothole_severity(
                            image_path,
                            bbox
                        )
                    )

                    severity = (
                        depth_result["severity"]
                    )

                    depth_score = (
                        depth_result["depth_score"]
                    )

                except Exception as e:

                    print(
                        "Depth Severity Error:",
                        str(e)
                    )

            detections.append(
                {
                    "class": class_name,
                    "confidence": round(
                        float(
                            box.conf[0].item()
                        ),
                        4
                    ),
                    "bbox": bbox,
                    "severity": severity,
                    "depth_score": depth_score
                }
            )

        return detections

    except Exception as e:

        print(
            "Live Detection Error:",
            str(e)
        )

        return []