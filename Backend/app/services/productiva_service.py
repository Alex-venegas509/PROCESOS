from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.productiva import Productiva
from app.schemas.productiva_shemas import ProductivaCreate, ProductivaUpdate

def crear_productiva(db: Session, data: ProductivaCreate):
    nueva = Productiva(**data.dict())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

def listar_productivas(db: Session):
    return db.query(Productiva).all()

def obtener_productiva(db: Session, productiva_id: int):
    item = db.query(Productiva).filter(Productiva.id == productiva_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Productiva no encontrada")
    return item

def actualizar_productiva(db: Session, productiva_id: int, data: ProductivaUpdate):
    item = obtener_productiva(db, productiva_id)
    for key, value in data.dict(exclude_unset=True).items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item

def eliminar_productiva(db: Session, productiva_id: int):
    item = obtener_productiva(db, productiva_id)
    db.delete(item)
    db.commit()
    return {"message": "Productiva eliminada correctamente"}
