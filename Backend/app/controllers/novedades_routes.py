from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from database.db import get_db
from schemas.novedades_schema import NovedadResponse, NovedadCreate
from services.novedades_service import create_novedad, get_novedades_by_cedula
import os
import shutil

router = APIRouter(prefix="/novedades", tags=["Novedades"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=NovedadResponse)
async def subir_novedad(
    cedula: str = Form(...),
    ficha: str = Form(...),
    tipo_documento: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Guardar archivo
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Crear registro en la base de datos
    novedad_data = NovedadCreate(
        cedula=cedula,
        ficha=ficha,
        tipo_documento=tipo_documento,
        nombre_archivo=file.filename,
        ruta_archivo=file_path
    )

    return create_novedad(db, novedad_data)

@router.get("/{cedula}", response_model=list[NovedadResponse])
def obtener_novedades(cedula: str, db: Session = Depends(get_db)):
    return get_novedades_by_cedula(db, cedula)
