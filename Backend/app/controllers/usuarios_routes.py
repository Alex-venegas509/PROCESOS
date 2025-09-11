from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import SessionLocal
from app.models.usuarios import Usuarios
from app.schemas.usuarios_shemas import UsuarioCreate, UsuarioResponse, UsuarioUpdate
from app.auth.security import hash_password

router = APIRouter(tags=["Usuarios"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=UsuarioResponse)
def crear_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    existe_cedula = db.query(Usuarios).filter(Usuarios.cedula == usuario.cedula).first()
    if existe_cedula:
        raise HTTPException(status_code=400, detail="La cédula ya está registrada")

    existe_correo = db.query(Usuarios).filter(Usuarios.correo == usuario.correo).first()
    if existe_correo:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    
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

@router.get("/", response_model=list[UsuarioResponse])
def listar_usuarios(db: Session = Depends(get_db)):
    return db.query(Usuarios).all()

@router.get("/{usuario_id}", response_model=UsuarioResponse)
def obtener_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.query(Usuarios).filter(Usuarios.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario

@router.put("/{usuario_id}", response_model=UsuarioResponse)
def actualizar_usuario(usuario_id: int, datos: UsuarioUpdate, db: Session = Depends(get_db)):
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

@router.delete("/{usuario_id}")
def eliminar_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.query(Usuarios).filter(Usuarios.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    db.delete(usuario)
    db.commit()
    return {"message": "Usuario eliminado correctamente"}
