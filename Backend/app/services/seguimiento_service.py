from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.seguimiento import Seguimiento
from app.schemas.seguimiento_shemas import SeguimientoCreate, SeguimientoUpdate

def crear_seguimiento(db: Session, data: SeguimientoCreate):
    nuevo = Seguimiento(**data.dict())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

def listar_seguimientos(db: Session):
    return db.query(Seguimiento).all()

def obtener_seguimiento(db: Session, seguimiento_id: int):
    seg = db.query(Seguimiento).filter(Seguimiento.id == seguimiento_id).first()
    if not seg:
        raise HTTPException(status_code=404, detail="Seguimiento no encontrado")
    return seg
