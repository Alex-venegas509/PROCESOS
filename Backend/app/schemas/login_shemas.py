from pydantic import BaseModel

class UserLogin(BaseModel):
    correo: str
    contrasena: str

class LoginResponse(BaseModel):
    success: bool
    message: str
    tipo: str | None = None
