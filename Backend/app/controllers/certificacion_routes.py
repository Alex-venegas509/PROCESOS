from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.db import SessionLocal
from app.schemas.certificacion_shemas import CertificacionCreate, CertificacionResponse, CertificacionUpdate
from app.services import certificacion_service as service

router = APIRouter(prefix="/certificacion", tags=["Certificacion"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=CertificacionResponse)
def crear(data: CertificacionCreate, db: Session = Depends(get_db)):
    return service.crear_certificacion(db, data)

@router.get("/", response_model=list[CertificacionResponse])
def listar(db: Session = Depends(get_db)):
    return service.listar_certificacion(db)

@router.get("/{id}", response_model=CertificacionResponse)
def obtener(id: int, db: Session = Depends(get_db)):
    return service.obtener_certificacion(db, id)

@router.put("/{id}", response_model=CertificacionResponse)
def actualizar(id: int, data: CertificacionUpdate, db: Session = Depends(get_db)):
    return service.actualizar_certificacion(db, id, data)

@router.delete("/{id}")
def eliminar(id: int, db: Session = Depends(get_db)):
    return service.eliminar_certificacion(db, id)
