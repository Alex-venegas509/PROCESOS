from sqlalchemy import Column, Integer, String, Text
from database.db import Base

class Usuarios(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True)
    apellido = Column(String, index=True)
    documento = Column(String, index=True)
    cedula = Column(Integer, unique=True, index=True)
    correo = Column(String, unique=True, index=True)
    contrasena = Column(Text, index=True)
    tipo = Column(String, index=True)