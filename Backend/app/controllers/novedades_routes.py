from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.db import SessionLocal
from app.schemas.novedades_shemas import NovedadCreate, NovedadResponse, NovedadUpdate
from app.services import novedades_service as service

router = APIRouter(prefix="/novedades", tags=["Novedades"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=NovedadResponse)
def crear(data: NovedadCreate, db: Session = Depends(get_db)):
    return service.crear_novedades(db, data)

@router.get("/", response_model=list[NovedadResponse])
def listar(db: Session = Depends(get_db)):
    return service.listar_novedades(db)

@router.get("/{id}", response_model=NovedadResponse)
def obtener(id: int, db: Session = Depends(get_db)):
    return service.obtener_novedades(db, id)

@router.put("/{id}", response_model=NovedadResponse)
def actualizar(id: int, data: NovedadUpdate, db: Session = Depends(get_db)):
    return service.actualizar_novedades(db, id, data)

@router.delete("/{id}")
def eliminar(id: int, db: Session = Depends(get_db)):
    return service.eliminar_novedades(db, id)
