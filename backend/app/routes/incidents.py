from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session

from ai.detector import detect_hazard
from app.database import get_db
from app.models.incident import Incident

import os
import uuid

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload-hazard")
async def upload_hazard(
    file: UploadFile = File(...),
    latitude: str = Form(None),
    longitude: str = Form(None),
    db: Session = Depends(get_db)
):
    try:
        # Save uploaded image
        filename = f"{uuid.uuid4()}_{file.filename}"
        filepath = os.path.join(UPLOAD_DIR, filename)

        with open(filepath, "wb") as buffer:
            buffer.write(await file.read())

        print("\n========== NEW UPLOAD ==========")
        print("File:", filename)
        print("Latitude:", latitude)
        print("Longitude:", longitude)

        # Run YOLO detection
        prediction = detect_hazard(filepath)

        print("YOLO Prediction:", prediction)

        # Generate unique incident ID
        incident_uuid = str(uuid.uuid4())

        # Create database record
        db_incident = Incident(
            incident_id=incident_uuid,
            image_path=filepath,
            status="created",
            hazard_type=prediction.get("issue", "Unknown"),
            severity=prediction.get("severity", "Low"),
            confidence=prediction.get("confidence", 0),
            department=prediction.get("department", "Inspection Required"),
            latitude=float(latitude) if latitude else None,
            longitude=float(longitude) if longitude else None
        )

        # Save to SQLite
        db.add(db_incident)
        db.commit()
        db.refresh(db_incident)

        response = {
            "success": True,
            "incident_id": incident_uuid,
            "issue": db_incident.hazard_type,
            "confidence": db_incident.confidence,
            "severity": db_incident.severity,
            "department": db_incident.department,
            "latitude": db_incident.latitude,
            "longitude": db_incident.longitude,
            "status": db_incident.status
        }

        print("Response Sent:", response)
        print("================================\n")

        return response

    except Exception as e:
        print("Upload Error:", str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}"
        )


@router.get("/incidents")
def get_incidents(db: Session = Depends(get_db)):
    incidents = db.query(Incident).all()

    return [
        {
            "id": incident.id,
            "incident_id": incident.incident_id,
            "image_path": incident.image_path,
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


@router.get("/dashboard-stats")
def dashboard_stats(db: Session = Depends(get_db)):
    incidents = db.query(Incident).all()

    return {
        "total": len(incidents),
        "created": len(
            [i for i in incidents if i.status == "created"]
        ),
        "assigned": len(
            [i for i in incidents if i.status == "assigned"]
        ),
        "verification": len(
            [i for i in incidents if i.status == "verification"]
        ),
        "resolved": len(
            [i for i in incidents if i.status == "resolved"]
        )
    } 
@router.get("/verification/pending")
def get_pending_verifications(db: Session = Depends(get_db)):
    incidents = (
        db.query(Incident)
        .filter(Incident.verification_status == "pending")
        .all()
    )

    return incidents
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
        raise HTTPException(404, "Incident not found")

    incident.verification_status = "approved"

    db.commit()

    return {"success": True}