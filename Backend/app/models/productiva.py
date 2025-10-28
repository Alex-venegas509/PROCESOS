from sqlalchemy import Column, Integer, String, BigInteger
from sqlalchemy.dialects.postgresql import JSON
from database.db import Base

class Productiva(Base):
    __tablename__ = "productiva"

    id = Column(Integer, primary_key=True, index=True)
    identificacion = Column(String(50), index=True)
    ficha = Column(BigInteger, index=True)
    discapacidad = Column(String, index=True)
    cual_discapacidad = Column(JSON, nullable=True)
    tipo_documento = Column(JSON, nullable=True)
    ruta_documentos = Column(JSON, nullable=True)
    