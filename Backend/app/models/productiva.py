from sqlalchemy import Column, Integer, String
from database.db import Base

class Productiva(Base):
    __tablename__ = "productiva"

    id = Column(Integer, primary_key=True, index=True)
    cedula = Column(Integer, unique=True, index=True)
    ficha = Column(Integer, index=True)
    discapacidad = Column(String, index=True)
    cual_capacidad = Column(String, index=True)
    nombre_archivo = Column(String, index=True)
    