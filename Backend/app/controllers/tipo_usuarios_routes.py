from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.db import SessionLocal
from app.schemas.tipo_usuarios_shemas import TipoUsuariosCreate, TipoUsuariosResponse, TipoUsuariosUpdate
from app.services import tipo_usuarios_service as service

router = APIRouter(tags=["Tipo_usuarios"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=TipoUsuariosResponse)
def crear(data: TipoUsuariosCreate, db: Session = Depends(get_db)):
    return service.crear_tipo_usuarios(db, data)

@router.get("/", response_model=list[TipoUsuariosResponse])
def listar(db: Session = Depends(get_db)):
    return service.listar_tipo_usuarios(db)

@router.get("/{id}", response_model=TipoUsuariosResponse)
def obtener(id: int, db: Session = Depends(get_db)):
    return service.obtener_tipo_usuarios(db, id)

@router.put("/{id}", response_model=TipoUsuariosResponse)
def actualizar(id: int, data: TipoUsuariosUpdate, db: Session = Depends(get_db)):
    return service.actualizar_tipo_usuarios(db, id, data)

@router.delete("/{id}")
def eliminar(id: int, db: Session = Depends(get_db)):
    return service.eliminar_tipo_usuarios(db, id)
