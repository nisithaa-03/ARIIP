from pathlib import Path
from ultralytics import YOLO

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
    try:
        results = model.predict(
            source=image_path,
            conf=0.25,
            verbose=False
        )

        # No detection found
        if len(results) == 0 or len(results[0].boxes) == 0:
            return {
                "issue": "Unknown",
                "confidence": 0,
                "severity": "Low",
                "department": "Inspection Required"
            }

        # Get highest-confidence detection
        boxes = results[0].boxes
        box = boxes[boxes.conf.argmax()]

        class_id = int(box.cls[0].item())
        confidence = float(box.conf[0].item()) * 100

        class_name = model.names[class_id]

        # Severity based on confidence
        if confidence >= 90:
            severity = "High"
        elif confidence >= 70:
            severity = "Medium"
        else:
            severity = "Low"

        # Department mapping
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