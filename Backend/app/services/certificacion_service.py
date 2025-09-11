from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.certificacion import Certificacion
from app.schemas.certificacion_shemas import CertificacionCreate, CertificacionUpdate

def crear_certificacion(db: Session, data: CertificacionCreate):
    nueva = Certificacion(**data.dict())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

def listar_certificacion(db: Session):
    return db.query(Certificacion).all()

def obtener_certificacion(db: Session, certificacion_id: int):
    item = db.query(Certificacion).filter(Certificacion.id == certificacion_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="certificacion no encontrada")
    return item

def actualizar_certificacion(db: Session, certificacion_id: int, data: CertificacionUpdate):
    item = obtener_certificacion(db, certificacion_id)
    for key, value in data.dict(exclude_unset=True).items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item

def eliminar_certificacion(db: Session, certificacion_id: int):
    item = obtener_certificacion(db, certificacion_id)
    db.delete(item)
    db.commit()
    return {"message": "Certificacion eliminada correctamente"}
