from sqlalchemy.orm import Session
from Backend.app.models.usuarios import Usuarios  # Ajusta el import a tu modelo real
import bcrypt

def login_user(db: Session, correo: str, contrasena: str):
    # Buscar usuario por correo
    tipo_usuario = Usuarios.tipo

    if not Usuarios:
        return {"success": False, "message": "Usuario o contraseña incorrectos"}

    # Verificar contraseña
    if not bcrypt.checkpw(contrasena.encode("utf-8"), Usuarios.contrasena.encode("utf-8")):
        return {"success": False, "message": "Usuario o contraseña incorrectos"}

    # Login exitoso
    return {
        "success": True,
        "message": "Login exitoso",
        "tipo": Usuarios.tipo
    }

