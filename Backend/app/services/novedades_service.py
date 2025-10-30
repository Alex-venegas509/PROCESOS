from sqlalchemy.orm import Session
from models.novedades import Novedad
from schemas.novedades_schema import NovedadCreate

def get_all_novedades(db: Session):
    return db.query(Novedad).all()

def get_novedades_by_cedula(db: Session, cedula: str):
    return db.query(Novedad).filter(Novedad.cedula == cedula).all()

def create_novedad(db: Session, novedad: NovedadCreate):
    db_novedad = Novedad(**novedad.dict())
    db.add(db_novedad)
    db.commit()
    db.refresh(db_novedad)
    return db_novedad

