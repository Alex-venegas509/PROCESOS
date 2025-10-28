from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
import os
import json
from database.db import SessionLocal
from app.schemas.productiva_shemas import ProductivaCreate, ProductivaResponse, ProductivaUpdate
from app.models.productiva import Productiva
from app.services import productiva_service as service

router = APIRouter(tags=["Productivas"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=ProductivaResponse)
def crear_etapaProductiva(data: ProductivaCreate, db: Session = Depends(get_db)):
    return service.crear_etapaProductiva(db, data)

@router.get("/", response_model=list[ProductivaResponse])
def listar_etapaProductiva(db: Session = Depends(get_db)):
    return service.listar_etapaProductiva(db)

@router.get("/{id}", response_model=ProductivaResponse)
def obtener_etapaProductiva(id: int, db: Session = Depends(get_db)):
    productiva = db.query(Productiva).filter(Productiva.id == productiva_id).first()
    if not productiva:
        raise HTTPException(status_code=404, detail="Etapa productiva no encontrada")
    return productiva

@router.put("/{productiva_id}", response_model=ProductivaResponse)
async def actualizar_EtapaProductiva(
    productiva_id: int,
    identificacion: str = Form(...),
    ficha: int = Form(...),
    discapacidad: str = Form (...),
    cual_discapacidad: list[str] = Form([]), 
    tipo_documento: list[str] = Form([]),
    documentos: list[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    productiva = db.query(Productiva).filter(Productiva.id == productiva_id).first()
    if not productiva:
        raise HTTPException(status_code=404, detail="Etapa productiva no encontrada")

    # 🔹 Actualizar todos los campos
    productiva.identificacion = identificacion
    productiva.ficha = ficha
    productiva.discapacidad = discapacidad
    productiva.cual_discapacidad = cual_discapacidad
    productiva.tipo_documento = tipo_documento

    # 📂 Manejo de archivos (como ya lo tienes)
    UPLOAD_DIR = "uploads/productiva"
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    if documentos:
        # Obtener rutas existentes correctamente
        if productiva.ruta_documentos:
            try:
                if isinstance(productiva.ruta_documentos, str):
                    rutas_existentes = json.loads(productiva.ruta_documentos)
                    if not isinstance(rutas_existentes, list):
                        rutas_existentes = []
                elif isinstance(productiva.ruta_documentos, list):
                    rutas_existentes = productiva.ruta_documentos
                else:
                    rutas_existentes = []
            except Exception:
                rutas_existentes = []
        else:
            rutas_existentes = []

        # Guardar los nuevos archivos
        nuevas_rutas = []
        for i, doc in enumerate(documentos):
            filename = f"doc_{productiva_id}_{i}_{doc.filename}"
            full_path = os.path.join(UPLOAD_DIR, filename)
            with open(full_path, "wb") as f:
                f.write(await doc.read())
            nuevas_rutas.append(f"productiva/{filename}")

        # Combinar sin duplicados y mantener orden
        todas_rutas = list(dict.fromkeys(rutas_existentes + nuevas_rutas))

        # Guardar en la base
        productiva.ruta_documentos = todas_rutas

    db.commit()
    db.refresh(productiva)

    return productiva

@router.delete("/{productiva_id}")
def eliminar_EtapaProductiva(productiva_id: int, db: Session = Depends(get_db)):
    return service.eliminar_etapaProductiva(db, productiva_id)

# 📂 Carpeta de subida
UPLOAD_DIR = "uploads/productiva"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/{productiva_id}/upload")
async def subir_archivos(
    productiva_id: int,
    documentos: list[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    productiva = db.query(Productiva).filter(Productiva.id == productiva_id).first()
    if not productiva:
        raise HTTPException(status_code=404, detail="Etapa productiva no encontrada")

    # Guardar documentos
    if documentos:
        # Obtener rutas existentes correctamente
        if productiva.ruta_documentos:
            try:
                if isinstance(productiva.ruta_documentos, str):
                    rutas_existentes = json.loads(productiva.ruta_documentos)
                    if not isinstance(rutas_existentes, list):
                        rutas_existentes = []
                elif isinstance(productiva.ruta_documentos, list):
                    rutas_existentes = productiva.ruta_documentos
                else:
                    rutas_existentes = []
            except Exception:
                rutas_existentes = []
        else:
            rutas_existentes = []

        # Guardar los nuevos archivos
        nuevas_rutas = []
        for i, doc in enumerate(documentos):
            filename = f"doc_{productiva_id}_{i}_{doc.filename}"
            full_path = os.path.join(UPLOAD_DIR, filename)
            with open(full_path, "wb") as f:
                f.write(await doc.read())
            nuevas_rutas.append(f"productiva/{filename}")

        # Combinar sin duplicados y mantener orden
        todas_rutas = list(dict.fromkeys(rutas_existentes + nuevas_rutas))

        # Guardar en la base
        productiva.ruta_documentos = todas_rutas

    db.commit()
    db.refresh(productiva)

    return {"message": "Archivos subidos correctamente", "productiva_id": productiva.id}

@router.delete("/{productiva_id}/documentos")
def eliminar_documento(
    productiva_id: int,
    filename: str = Query(..., description="Ruta del documento a eliminar"),
    db: Session = Depends(get_db),
):
    productiva = db.query(Productiva).filter(Productiva.id == productiva_id).first()
    if not productiva:
        raise HTTPException(status_code=404, detail="Etapa productiva no encontrada")

    # Convertir en lista
    rutas = []
    if productiva.ruta_documentos:
        try:
            rutas = (
                json.loads(productiva.ruta_documentos)
                if isinstance(productiva.ruta_documentos, str)
                else productiva.ruta_documentos
            )
        except Exception:
            rutas = (
                productiva.ruta_documentos.split(";")
                if isinstance(productiva.ruta_documentos, str)
                else []
            )

    if filename not in rutas:
        raise HTTPException(status_code=404, detail="Documento no encontrado")

    file_path = os.path.join("uploads", filename)
    if os.path.exists(file_path):
        os.remove(file_path)

    rutas = [r for r in rutas if r != filename]
    productiva.ruta_documentos = rutas
    db.commit()
    db.refresh(productiva)

    return {"message": "Documento eliminado correctamente", "ruta_documentos": rutas}
