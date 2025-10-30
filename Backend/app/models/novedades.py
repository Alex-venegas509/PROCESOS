from sqlalchemy import Column, Integer, String
from database.db import Base

class Novedad(Base):
    __tablename__ = "novedades"

    id = Column(Integer, primary_key=True, index=True)
    cedula = Column(String, index=True)
    ficha = Column(String, index=True)
    tipo_documento = Column(String, index=True)
    nombre_archivo = Column(String)
    ruta_archivo = Column(String)
