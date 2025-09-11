from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.estudiantes import Estudiantes
from app.schemas.estudiantes_shemas import EstudianteCreate, EstudianteUpdate


def crear_estudiante(db: Session, estudiante: EstudianteCreate):
    db_est = db.query(Estudiantes).filter(Estudiantes.identificacion == estudiante.identificacion).first()
    if db_est:
        raise HTTPException(status_code=400, detail="Identificación ya registrada")

    nuevo_estudiante = Estudiantes(**estudiante.model_dump())
    db.add(nuevo_estudiante)
    db.commit()
    db.refresh(nuevo_estudiante)
    return nuevo_estudiante


def listar_estudiantes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Estudiantes).offset(skip).limit(limit).all()


def obtener_estudiante(db: Session, estudiante_id: int):
    estudiante = db.query(Estudiantes).filter(Estudiantes.id == estudiante_id).first()
    if not estudiante:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
    return estudiante


def actualizar_estudiante(db: Session, estudiante_id: int, datos: EstudianteUpdate):
    estudiante = db.query(Estudiantes).filter(Estudiantes.id == estudiante_id).first()
    if not estudiante:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")

    # Verificar duplicado de identificación
    if "identificacion" in datos.model_dump(exclude_unset=True):
        existe = db.query(Estudiantes).filter(
            Estudiantes.identificacion == datos.identificacion,
            Estudiantes.id != estudiante_id
        ).first()
        if existe:
            raise HTTPException(status_code=400, detail="Identificación ya registrada")

    for key, value in datos.model_dump(exclude_unset=True).items():
        setattr(estudiante, key, value)

    db.commit()
    db.refresh(estudiante)
    return estudiante


def eliminar_estudiante(db: Session, estudiante_id: int):
    estudiante = db.query(Estudiantes).filter(Estudiantes.id == estudiante_id).first()
    if not estudiante:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")

    db.delete(estudiante)
    db.commit()
    return {"message": "Estudiante eliminado correctamente"}
