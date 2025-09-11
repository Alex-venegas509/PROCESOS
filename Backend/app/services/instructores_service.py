from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.instructores import Instructores
from app.schemas.instructores_shemas import InstructorCreate, InstructorUpdate

def crear_instructores(db: Session, data: InstructorCreate):
    nueva = Instructores(**data.dict())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

def listar_instructores(db: Session):
    return db.query(Instructores).all()

def obtener_instructores(db: Session, instructores_id: int):
    item = db.query(Instructores).filter(Instructores.id == instructores_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="intructores no encontrados")
    return item

def actualizar_instructores(db: Session, instructores_id: int, data: InstructorUpdate):
    item = obtener_instructores(db, instructores_id)
    for key, value in data.dict(exclude_unset=True).items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item

def eliminar_instructores(db: Session, instructores_id: int):
    item = obtener_instructores(db, instructores_id)
    db.delete(item)
    db.commit()
    return {"message": "Instructor eliminado correctamente"}
