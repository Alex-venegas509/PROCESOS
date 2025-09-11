from sqlalchemy import Column, Integer, String
from database.db import Base

class Tipo_usuarios(Base):
    __tablename__ = "tipo_usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True)
    apellido = Column(String, index=True)
    cedula = Column(Integer, unique=True, index=True)
    correo = Column(String, unique=True, index=True)
    tipo = Column(String, index=True)