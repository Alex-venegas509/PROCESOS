from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.usuarios import Usuarios
from app.schemas.usuarios_shemas import UsuarioCreate, UsuarioUpdate
from app.auth.security import hash_password


def crear_usuario(db: Session, usuario: UsuarioCreate):
    db_user = db.query(Usuarios).filter(Usuarios.correo == usuario.correo).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Correo ya registrado")

    nuevo_usuario = Usuarios(
        nombre=usuario.nombre,
        apellido=usuario.apellido,
        documento=usuario.documento,
        cedula=usuario.cedula,
        correo=usuario.correo,
        contrasena=hash_password(usuario.contrasena),
        tipo=usuario.tipo
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario


def listar_usuarios(db: Session):
    return db.query(Usuarios).all()


def obtener_usuario(db: Session, usuario_id: int):
    usuario = db.query(Usuarios).filter(Usuarios.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario


def actualizar_usuario(db: Session, usuario_id: int, datos: UsuarioUpdate):
    usuario = db.query(Usuarios).filter(Usuarios.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    for key, value in datos.dict(exclude_unset=True).items():
        if key == "contrasena":
            value = hash_password(value)
        setattr(usuario, key, value)

    db.commit()
    db.refresh(usuario)
    return usuario


def eliminar_usuario(db: Session, usuario_id: int):
    usuario = db.query(Usuarios).filter(Usuarios.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    db.delete(usuario)
    db.commit()
    return {"message": "Usuario eliminado correctamente"}
