from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import timedelta
from app.auth.jwt_handler import create_access_token
from database.db import SessionLocal
from app.auth import security
from app.models.usuarios import Usuarios
from sqlalchemy.orm import Session

router = APIRouter()

class LoginRequest(BaseModel):
    correo: str
    contrasena: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def procesar_login(data: LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuarios).filter(Usuarios.correo == data.correo).first()

    if not usuario or not security.verify_password(data.contrasena, usuario.contrasena):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    # Crear token con el tipo directamente desde Usuarios
    access_token = create_access_token(
        data={"sub": usuario.correo, "tipo": usuario.tipo},
        expires_delta=timedelta(hours=1)
    )

    return {
        "success": True,
        "tipo": usuario.tipo,
        "access_token": access_token,
        "token_type": "bearer"
    }

