from sqlalchemy import Column, Integer, String, Text, BigInteger
from sqlalchemy.dialects.postgresql import JSON
from database.db import Base

class Estudiantes(Base):
    __tablename__ = "estudiantes"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), index=True)
    apellidos = Column(String(100), index=True)
    tipo_identificacion = Column(String(50), index=True)
    identificacion = Column(String(50), index=True) 
    correo = Column(String(150), unique=True, index=True)
    correo_institucional = Column(String(150), unique=True, index=True)
    direccion = Column(String(200), index=True)
    celular = Column(String(20), index=True)
    telefono = Column(String(20), index=True)
    ficha = Column(BigInteger, index=True)
    tipo_documento = Column(JSON)
    ruta_foto = Column(Text, nullable=True)
    ruta_documentos = Column(JSON, nullable=True)   
