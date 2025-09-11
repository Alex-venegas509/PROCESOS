from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.db import SessionLocal
from app.schemas.seguimiento_shemas import SeguimientoCreate, SeguimientoResponse, SeguimientoUpdate
from app.services import seguimiento_service as service

router = APIRouter(prefix="/seguimiento", tags=["Seguimientos"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=SeguimientoResponse)
def crear(data: SeguimientoCreate, db: Session = Depends(get_db)):
    return service.crear_seguimiento(db, data)

@router.get("/", response_model=list[SeguimientoResponse])
def listar(db: Session = Depends(get_db)):
    return service.listar_seguimientos(db)