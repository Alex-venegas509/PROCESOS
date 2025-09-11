from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.novedades import Novedades
from app.schemas.novedades_shemas import NovedadCreate, NovedadUpdate

def crear_novedades(db: Session, data: NovedadCreate):
    nueva = Novedades(**data.dict())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

def listar_novedades(db: Session):
    return db.query(Novedades).all()

def obtener_novedad(db: Session, novedad_id: int):
    item = db.query(Novedades).filter(Novedades.id == novedad_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Novedad no encontrada")
    return item

def actualizar_novedad(db: Session, novedad_id: int, data: NovedadUpdate):
    item = obtener_novedad(db, novedad_id)
    for key, value in data.dict(exclude_unset=True).items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item

def eliminar_novedad(db: Session, novedad_id: int):
    item = obtener_novedad(db, novedad_id)
    db.delete(item)
    db.commit()
    return {"message": "Novedad eliminada correctamente"}
