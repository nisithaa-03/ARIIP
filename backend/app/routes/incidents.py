
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session

from ai.detector import detect_hazard, detect_live
from app.database import get_db
from app.models.incident import Incident

import os
import tempfile
import math
import uuid

router = APIRouter()

from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[2]
UPLOAD_DIR = BACKEND_ROOT / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def to_public_image_path(image_path: str | None) -> str:
    if not image_path:
        return ""

    normalized = image_path.replace("\\", "/")
    relative = normalized

    if "/uploads/" in normalized:
        relative = normalized.split("/uploads/", 1)[1]
    elif "\\uploads\\" in normalized:
        relative = normalized.split("\\uploads\\", 1)[1]
    elif normalized.startswith(str(UPLOAD_DIR).replace("\\", "/")):
        relative = normalized.replace(str(UPLOAD_DIR).replace("\\", "/") + "/", "")
    elif normalized.startswith(str(UPLOAD_DIR)):
        relative = normalized.replace(str(UPLOAD_DIR) + "\\", "")

    return f"uploads/{relative.lstrip('/')}" if relative else ""

# ==========================================
# DUPLICATE DETECTION AGENT
# ==========================================

DUPLICATE_DISTANCE_METERS = 50

# These statuses represent complaints that are
# still active and may be duplicates.
ACTIVE_STATUSES = {
    "created",
    "assigned",
    "repair_started",
    "verification",
}


def calculate_distance_meters(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float
) -> float:
    """Calculate distance between two GPS points."""
    earth_radius = 6_371_000

    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)

    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1_rad)
        * math.cos(lat2_rad)
        * math.sin(delta_lon / 2) ** 2
    )

    # Protect against floating-point rounding errors.
    a = max(0.0, min(1.0, a))

    return earth_radius * 2 * math.atan2(
        math.sqrt(a),
        math.sqrt(1 - a)
    )


def detect_duplicate_incident(
    db: Session,
    hazard_type: str,
    latitude: float | None,
    longitude: float | None,
):
    """
    Find an active complaint with the same hazard type
    within the configured GPS distance.

    Returns the existing incident and distance if found.
    Otherwise returns (None, None).
    """

    # Without coordinates, don't guess that two reports
    # refer to the same physical hazard.
    if latitude is None or longitude is None:
        return None, None

    normalized_hazard = hazard_type.strip().casefold()

    if not normalized_hazard:
        return None, None

    candidates = (
        db.query(Incident)
        .filter(
            Incident.latitude.isnot(None),
            Incident.longitude.isnot(None),
        )
        .all()
    )

    for candidate in candidates:
        if candidate.status.strip().casefold() not in ACTIVE_STATUSES:
            continue

        if (
            candidate.hazard_type or ""
        ).strip().casefold() != normalized_hazard:
            continue

        distance = calculate_distance_meters(
            latitude,
            longitude,
            candidate.latitude,
            candidate.longitude,
        )

        if distance <= DUPLICATE_DISTANCE_METERS:
            return candidate, round(distance, 2)

    return None, None



# --------------------------------------------------
# 1. LIVE MONITORING - DOES NOT SAVE COMPLAINTS
# --------------------------------------------------

@router.post("/live-detect")
async def live_detect(file: UploadFile = File(...)):
    temp_path = None

    try:
        suffix = os.path.splitext(file.filename or "")[1] or ".jpg"

        with tempfile.NamedTemporaryFile(
            mode="wb",
            suffix=suffix,
            dir=UPLOAD_DIR,
            delete=False
        ) as temp_file:
            temp_path = temp_file.name
            temp_file.write(await file.read())

        detections = detect_live(temp_path)

        # Return bounding boxes and detection details to the frontend.
        return {
            "success": True,
            "detections": detections
        }

    except Exception as error:
        import traceback
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=f"Live detection failed: {str(error)}"
        ) from error

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

# --------------------------------------------------
# 2. IMAGE DETECTION - DOES NOT SAVE COMPLAINTS
# --------------------------------------------------
@router.post("/detect-hazard")
async def detect_hazard_only(file: UploadFile = File(...)):
    temp_path = None

    try:
        suffix = os.path.splitext(file.filename or "")[1] or ".jpg"

        with tempfile.NamedTemporaryFile(
            mode="wb",
            suffix=suffix,
            dir=UPLOAD_DIR,
            delete=False
        ) as temp_file:
            temp_path = temp_file.name
            temp_file.write(await file.read())

        # Get individual detections, including bounding boxes.
        detections = detect_live(temp_path)

        if not detections:
            return {
                "success": True,
                "issue": "Unknown",
                "confidence": 0,
                "depth_score": None,
                "coverage": None,
                "severity": "Low",
                "department": "Inspection Required",
                "detections": []
            }

        # Use the highest-confidence detection for the summary.
        best_detection = max(
            detections,
            key=lambda detection: float(
                detection.get("confidence", 0)
            )
        )

        confidence = float(
            best_detection.get("confidence", 0) or 0
        )

        return {
            "success": True,
            "issue": best_detection.get("class", "Unknown"),
            "confidence": round(
                confidence * 100 if confidence <= 1 else confidence,
                2
            ),
            "depth_score": best_detection.get("depth_score"),
            "coverage": best_detection.get("coverage"),
            "severity": best_detection.get("severity", "Low"),
            "department": best_detection.get(
                "department", "Inspection Required"
            ),
            "detections": detections
        }

    except Exception as error:
        import traceback
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=f"Hazard detection failed: {error}"
        ) from error

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

# --------------------------------------------------
# 3. FINAL COMPLAINT SUBMISSION - SAVES TO SQLITE
# --------------------------------------------------
@router.post("/incidents")
async def create_incident(
    file: UploadFile = File(...),
    incident_id: str = Form(...),
    hazard_type: str = Form(...),
    severity: str = Form(...),
    confidence: float = Form(...),
    department: str = Form(...),
    latitude: str = Form(None),
    longitude: str = Form(None),
    db: Session = Depends(get_db)
):
    filepath = None

    try:
        # Make repeated submissions with the same ID idempotent.
        existing = (
            db.query(Incident)
            .filter(Incident.incident_id == incident_id)
            .first()
        )

        if existing:
            return {
                "success": True,
                "incident_id": existing.incident_id,
                "issue": existing.hazard_type,
                "severity": existing.severity,
                "confidence": round(
                    existing.confidence * 100
                    if existing.confidence <= 1
                    else existing.confidence,
                    2
                ),
                "department": existing.department,
                "status": existing.status
            }
            
        # Run Duplicate Detection Agent before saving.
        submitted_latitude = (
            float(latitude) if latitude else None
        )
        submitted_longitude = (
            float(longitude) if longitude else None
        )

        duplicate, distance = detect_duplicate_incident(
            db=db,
            hazard_type=hazard_type,
            latitude=submitted_latitude,
            longitude=submitted_longitude,
        )

        if duplicate:
            return {
                "success": True,
                "duplicate": True,
                "message": "A similar active complaint already exists.",
                "incident_id": duplicate.incident_id,
                "issue": duplicate.hazard_type,
                "severity": duplicate.severity,
                "department": duplicate.department,
                "status": duplicate.status,
                "distance_meters": distance,
            }


        filename = (
            f"{uuid.uuid4()}_"
            f"{os.path.basename(file.filename or 'hazard.jpg')}"
        )
        filepath = str(UPLOAD_DIR / filename)

        with open(filepath, "wb") as buffer:
            buffer.write(await file.read())

        public_image_path = to_public_image_path(filepath)

        # Frontend confidence is expected as a percentage (0-100).
        normalized_confidence = (
            confidence / 100 if confidence > 1 else confidence
        )

        db_incident = Incident(
            incident_id=incident_id,
            image_path=public_image_path,
            status="created",
            hazard_type=hazard_type,
            severity=severity,
            confidence=normalized_confidence,
            department=department,
            latitude=float(latitude) if latitude else None,
            longitude=float(longitude) if longitude else None
        )

        db.add(db_incident)
        db.commit()
        db.refresh(db_incident)

        return {
            "success": True,
            "incident_id": db_incident.incident_id,
            "issue": db_incident.hazard_type,
            "severity": db_incident.severity,
            "confidence": round(
                db_incident.confidence * 100, 2
            ),
            "department": db_incident.department,
            "latitude": db_incident.latitude,
            "longitude": db_incident.longitude,
            "status": db_incident.status
        }

    except HTTPException:
        raise

    except Exception as error:
        db.rollback()

        if filepath and os.path.exists(filepath):
            os.remove(filepath)

        raise HTTPException(
            status_code=500,
            detail=f"Complaint submission failed: {error}"
        ) from error


# --------------------------------------------------
# 4. EXISTING OFFLINE SYNC ENDPOINT
#    KEEP ITS CURRENT SAVE-TO-DATABASE BEHAVIOR
# --------------------------------------------------

@router.post("/upload-hazard")
async def upload_hazard(
    file: UploadFile = File(...),
    latitude: str = Form(None),
    longitude: str = Form(None),
    db: Session = Depends(get_db)
):
    filepath = None

    try:
        # Convert coordinates safely
        submitted_latitude = (
            float(latitude) if latitude not in (None, "") else None
        )
        submitted_longitude = (
            float(longitude) if longitude not in (None, "") else None
        )

        # Save uploaded image
        filename = (
            f"{uuid.uuid4()}_"
            f"{os.path.basename(file.filename or 'hazard.jpg')}"
        )
        filepath = str(UPLOAD_DIR / filename)

        with open(filepath, "wb") as buffer:
            buffer.write(await file.read())

        public_image_path = to_public_image_path(filepath)

        # Run hazard detection
        prediction = detect_hazard(filepath)
        confidence = float(prediction.get("confidence", 0) or 0)

        # Create incident
        incident_uuid = str(uuid.uuid4())

        db_incident = Incident(
            incident_id=incident_uuid,
            image_path=public_image_path,
            status="created",
            hazard_type=prediction.get(
                "issue", prediction.get("class", "Unknown")
            ),
            severity=prediction.get("severity", "Low"),
            confidence=confidence,
            department=prediction.get(
                "department", "Inspection Required"
            ),
            latitude=submitted_latitude,
            longitude=submitted_longitude
        )

        # Save to database
        db.add(db_incident)
        db.commit()
        db.refresh(db_incident)

        return {
            "success": True,
            "incident_id": incident_uuid,
            "issue": db_incident.hazard_type,
            "confidence": round(
                db_incident.confidence * 100
                if db_incident.confidence <= 1
                else db_incident.confidence,
                2
            ),
            "depth_score": prediction.get("depth_score"),
            "coverage": prediction.get("coverage"),
            "severity": db_incident.severity,
            "department": db_incident.department,
            "latitude": db_incident.latitude,
            "longitude": db_incident.longitude,
            "status": db_incident.status
        }

    except Exception as error:
        db.rollback()

        print("UPLOAD ERROR:", repr(error))

        import traceback
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(error)}"
        ) from error



# --------------------------------------------------
# 5. GET ALL SAVED COMPLAINTS
# --------------------------------------------------
@router.get("/incidents")
def get_incidents(db: Session = Depends(get_db)):
    incidents = (
        db.query(Incident)
        .order_by(Incident.created_at.desc())
        .all()
    )

    return [
        {
            "id": incident.id,
            "incident_id": incident.incident_id,
            "image_path": to_public_image_path(incident.image_path),
            "status": incident.status,
            "hazard_type": incident.hazard_type,
            "severity": incident.severity,
            "confidence": incident.confidence,
            "department": incident.department,
            "latitude": incident.latitude,
            "longitude": incident.longitude,
            "created_at": incident.created_at
        }
        for incident in incidents
    ]


# --------------------------------------------------
# 6. UPDATE INCIDENT STATUS - ONE DEFINITION ONLY
# --------------------------------------------------
@router.put("/incidents/{incident_id}/status")
def update_status(
    incident_id: str,
    status: str,
    db: Session = Depends(get_db)
):
    incident = (
        db.query(Incident)
        .filter(Incident.incident_id == incident_id)
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    incident.status = status
    db.commit()

    return {
        "success": True,
        "incident_id": incident_id,
        "new_status": status
    }


# --------------------------------------------------
# 7. DASHBOARD STATISTICS
# --------------------------------------------------
@router.get("/dashboard-stats")
def dashboard_stats(db: Session = Depends(get_db)):
    incidents = db.query(Incident).all()

    return {
        "total": len(incidents),
        "created": sum(
            1 for incident in incidents
            if incident.status == "created"
        ),
        "assigned": sum(
            1 for incident in incidents
            if incident.status == "assigned"
        ),
        "verification": sum(
            1 for incident in incidents
            if incident.status == "verification"
        ),
        "resolved": sum(
            1 for incident in incidents
            if incident.status == "resolved"
        )
    }


# --------------------------------------------------
# 8. PENDING VERIFICATIONS
# --------------------------------------------------
@router.get("/verification/pending")
def get_pending_verifications(db: Session = Depends(get_db)):
    incidents = (
        db.query(Incident)
        .filter(Incident.verification_status == "pending")
        .all()
    )

    return incidents


# --------------------------------------------------
# 9. APPROVE VERIFICATION
# --------------------------------------------------
@router.put("/verification/{incident_id}/approve")
def approve_verification(
    incident_id: str,
    db: Session = Depends(get_db)
):
    incident = (
        db.query(Incident)
        .filter(Incident.incident_id == incident_id)
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    incident.verification_status = "approved"
    db.commit()

    return {"success": True}
