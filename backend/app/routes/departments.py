from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.department import Department

router = APIRouter()


@router.get("/departments")
def get_departments(db: Session = Depends(get_db)):
    departments = db.query(Department).all()

    return [
        {
            "id": dept.id,
            "name": dept.name,
            "description": dept.description,
            "jurisdiction": dept.jurisdiction,
        }
        for dept in departments
    ]


@router.post("/departments")
def create_department(
    department: dict,
    db: Session = Depends(get_db)
):
    new_department = Department(
        name=department["name"],
        description=department.get("description", ""),
        jurisdiction=department.get("jurisdiction", "")
    )

    db.add(new_department)
    db.commit()
    db.refresh(new_department)

    return {
        "id": new_department.id,
        "name": new_department.name,
        "description": new_department.description,
        "jurisdiction": new_department.jurisdiction
    }