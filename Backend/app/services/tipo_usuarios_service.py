from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.tipo_usuarios import Tipo_usuarios
from app.schemas.tipo_usuarios_shemas import TipoUsuariosCreate, TipoUsuariosUpdate

def crear_tipo_usuarios(db: Session, data: TipoUsuariosCreate):
    nueva = Tipo_usuarios(**data.dict())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

def listar_tipo_usuarios(db: Session):
    return db.query(Tipo_usuarios).all()

def obtener_tipo_usuarios(db: Session, tipo_usuarios_id: int):
    item = db.query(Tipo_usuarios).filter(Tipo_usuarios.id == tipo_usuarios_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Tipo usuarios no encontradas")
    return item

def actualizar_tipo_usuarios(db: Session, tipo_usuarios_id: int, data: TipoUsuariosUpdate):
    item = obtener_tipo_usuarios(db, tipo_usuarios_id)
    for key, value in data.dict(exclude_unset=True).items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item

def eliminar_tipo_usuarios(db: Session, tipo_usuarios_id: int):
    item = obtener_tipo_usuarios(db, tipo_usuarios_id)
    db.delete(item)
    db.commit()
    return {"message": "Tipo usuarios eliminados correctamente"}
