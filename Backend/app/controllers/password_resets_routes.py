# app/controllers/recuperar_contrasena_controller.py
from fastapi import APIRouter, HTTPException, Depends, Form
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from sqlalchemy import text
import secrets
from app.services.password_resets_service import enviar_correo
from database.db import get_db
from app.auth.security import hash_password

router = APIRouter(tags=["password"])

# Schema para request
class SolicitarRecuperacion(BaseModel):
    email: EmailStr


# 1. Solicitar recuperación
@router.post("/")
def solicitar_recuperacion(data: SolicitarRecuperacion, db=Depends(get_db)):
    email = data.email

    # Verificar si el correo existe en la tabla usuarios
    usuario = db.execute(
        text("SELECT * FROM usuarios WHERE correo = :correo"),
        {"correo": email}
    ).fetchone()
    if not usuario:
        raise HTTPException(status_code=404, detail="El correo no se encuentra registrado")

    # Generar token 
    token = secrets.token_hex(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)

    # Eliminar tokens previos
    db.execute(text("DELETE FROM password_resets WHERE email = :correo"), {"correo": email})

    # Guardar nuevo token
    db.execute(text("INSERT INTO password_resets (email, token, expires_at, used, created_at) VALUES (:email, :token, :expires, CAST(:used AS BOOLEAN), NOW())"),
    {"email": email, "token": token, "expires": expires_at, "used": False}
    )
    db.commit()

    # Crear enlace de recuperación (frontend Next.js)
    enlace = f"http://localhost:3000/confirmar_contrasena/?token={token}"

    # Enviar correo
    cuerpo = f"""
    Hola {usuario._mapping.get('nombre', 'Usuario')},
    <br><br>
    Has solicitado recuperar tu contraseña. Haz clic en el siguiente enlace para continuar:
    <br><a href="{enlace}">Restablecer Contraseña</a>
    <br><br>Este enlace expira en 1 hora.
    """

    enviar_correo(email, "Recuperación de contraseña", cuerpo)

    return {"success": True, "message": "Se ha enviado un enlace de recuperación a tu correo electrónico"}



# Validar token
@router.get("/validate")
def validar_token(token: str, db=Depends(get_db)):
    reset = db.execute(
        text("SELECT * FROM password_resets WHERE token = :token AND expires_at > NOW()"),
        {"token": token}
    ).fetchone()

    if not reset:
        raise HTTPException(status_code=400, detail="Token inválido o expirado")

    return {"success": True, "message": "Token válido"}


# Resetear contraseña
@router.post("/reset")
def reset_password(
    token: str = Form(...),
    password: str = Form(...),
    db=Depends(get_db)
):
    # Verificar token
    reset = db.execute(
        text("SELECT * FROM password_resets WHERE token = :token AND expires_at > NOW()"),
        {"token": token}
    ).fetchone()

    if not reset:
        raise HTTPException(status_code=400, detail="Token inválido o expirado")

    email = reset._mapping["email"]

    # Encriptar nueva contraseña
    hashed_password = hash_password(password)

    # Actualizar contraseña en usuarios
    db.execute(
        text("UPDATE usuarios SET contrasena = :password WHERE correo = :correo"),
        {"password": hashed_password, "correo": email}
    )

    # Eliminar token usado
    db.execute(
        text("DELETE FROM password_resets WHERE email = :correo"),
        {"correo": email}
    )

    db.commit()

    return {"success": True, "message": "Contraseña actualizada correctamente"}
