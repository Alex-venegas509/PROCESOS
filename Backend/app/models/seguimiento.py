from sqlalchemy import Column, Integer, String
from database.db import Base

class Seguimiento(Base):
    __tablename__ = "seguimiento"

    id = Column(Integer, primary_key=True, index=True)
    cedula = Column(Integer, unique=True, index=True)
    ficha = Column(Integer, index=True)
    nombre_archivo = Column(String, index=True)
    