from sqlalchemy import Column, Integer, String
from database.db import Base

class Instructores(Base):
    __tablename__ = "instructores"

    id = Column(Integer, primary_key=True, index=True)
    cedula = Column(Integer, unique=True, index=True)
    ficha = Column(Integer, index=True)
    nombre_archivo = Column(String, index=True)
    