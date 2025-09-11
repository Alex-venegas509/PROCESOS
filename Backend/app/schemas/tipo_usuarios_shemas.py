from pydantic import BaseModel, EmailStr

# 📌 Schema para crear un tipo_usuario
class TipoUsuariosCreate(BaseModel):
    nombre: str
    apellido: str
    cedula: int
    correo: EmailStr
    tipo: str

# 📌 Schema para actualizar un tipo_usuario
class TipoUsuariosUpdate(BaseModel):
    nombre: str | None = None
    apellido: str | None = None
    cedula: int | None = None
    correo: EmailStr | None = None
    tipo: str | None = None

# 📌 Schema para mostrar respuesta
class TipoUsuariosResponse(BaseModel):
    id: int
    nombre: str
    apellido: str
    cedula: int
    correo: EmailStr
    tipo: str

    class Config:
        from_attributes = True  # 👈 reemplaza orm_mode=True en Pydantic v2
