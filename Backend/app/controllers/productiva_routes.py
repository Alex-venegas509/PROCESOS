from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.db import SessionLocal
from app.schemas.productiva_shemas import ProductivaCreate, ProductivaResponse, ProductivaUpdate
from app.services import productiva_service as service

router = APIRouter(prefix="/productiva", tags=["Productivas"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=ProductivaResponse)
def crear(data: ProductivaCreate, db: Session = Depends(get_db)):
    return service.crear_productiva(db, data)

@router.get("/", response_model=list[ProductivaResponse])
def listar(db: Session = Depends(get_db)):
    return service.listar_productiva(db)

@router.get("/{id}", response_model=ProductivaResponse)
def obtener(id: int, db: Session = Depends(get_db)):
    return service.obtener_productiva(db, id)

@router.put("/{id}", response_model=ProductivaResponse)
def actualizar(id: int, data: ProductivaUpdate, db: Session = Depends(get_db)):
    return service.actualizar_productiva(db, id, data)

@router.delete("/{id}")
def eliminar(id: int, db: Session = Depends(get_db)):
    return service.eliminar_productiva(db, id)
