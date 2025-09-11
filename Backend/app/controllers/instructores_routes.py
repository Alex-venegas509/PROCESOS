from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.db import SessionLocal
from app.schemas.instructores_shemas import InstructorCreate, InstructorResponse, InstructorUpdate
from app.services import instructores_service as service

router = APIRouter(prefix="/instructores", tags=["Instructores"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=InstructorResponse)
def crear(data: InstructorCreate, db: Session = Depends(get_db)):
    return service.crear_instructores(db, data)

@router.get("/", response_model=list[InstructorResponse])
def listar(db: Session = Depends(get_db)):
    return service.listar_instructores(db)

@router.get("/{id}", response_model=InstructorResponse)
def obtener(id: int, db: Session = Depends(get_db)):
    return service.obtener_instructores(db, id)

@router.put("/{id}", response_model=InstructorResponse)
def actualizar(id: int, data: InstructorUpdate, db: Session = Depends(get_db)):
    return service.actualizar_instructores(db, id, data)

@router.delete("/{id}")
def eliminar(id: int, db: Session = Depends(get_db)):
    return service.eliminar_instructores(db, id)
