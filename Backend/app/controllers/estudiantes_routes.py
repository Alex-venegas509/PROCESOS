from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
import os
import json
from database.db import SessionLocal
from app.schemas.estudiantes_shemas import EstudianteCreate, EstudianteResponse, EstudianteUpdate
from app.services import estudiantes_service as service
from app.models.estudiantes import Estudiantes

router = APIRouter(tags=["Estudiantes"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=EstudianteResponse)
def crear_estudiante(estudiante: EstudianteCreate, db: Session = Depends(get_db)):
    return service.crear_estudiante(db, estudiante)

@router.get("/", response_model=list[EstudianteResponse])
def listar_estudiantes(db: Session = Depends(get_db)):
    return service.listar_estudiantes(db)

@router.get("/{estudiante_id}", response_model=EstudianteResponse)
def obtener_estudiante(estudiante_id: int, db: Session = Depends(get_db)):
    est = db.query(Estudiantes).filter(Estudiantes.id == estudiante_id).first()
    if not est:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
    return est

@router.put("/{estudiante_id}", response_model=EstudianteResponse)
async def actualizar_estudiante(
    estudiante_id: int,
    nombre: str = Form(...),
    apellidos: str = Form(...),
    tipo_identificacion: str = Form(...),
    identificacion: str = Form(...),
    correo: str = Form(...),
    correo_institucional: str = Form(None),
    direccion: str = Form(None),
    celular: str = Form(None),
    telefono: str = Form(None),
    ficha: int = Form(...),
    tipo_documento: list[str] = Form([]),
    foto: UploadFile = File(None),
    documentos: list[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    estudiante = db.query(Estudiantes).filter(Estudiantes.id == estudiante_id).first()
    if not estudiante:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")

    # 🔹 Actualizar todos los campos
    estudiante.nombre = nombre
    estudiante.apellidos = apellidos
    estudiante.tipo_identificacion = tipo_identificacion
    estudiante.identificacion = identificacion
    estudiante.correo = correo
    estudiante.correo_institucional = correo_institucional
    estudiante.direccion = direccion
    estudiante.celular = celular
    estudiante.telefono = telefono
    estudiante.ficha = ficha
    estudiante.tipo_documento = tipo_documento

    # 📂 Manejo de archivos (como ya lo tienes)
    UPLOAD_DIR = "uploads/estudiantes"
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    if foto:
    # 🔹 Eliminar la foto anterior si existe
        if estudiante.ruta_foto:
            old_path = os.path.join("uploads", estudiante.ruta_foto)
            if os.path.exists(old_path):
                os.remove(old_path)

    # 🔹 Guardar la nueva
        filename = f"foto_{estudiante_id}_{foto.filename}"
        foto_path = f"estudiantes/{filename}"
        full_path = os.path.join(UPLOAD_DIR, filename)

        with open(full_path, "wb") as f:
            f.write(await foto.read())

        estudiante.ruta_foto = foto_path

    if documentos:
        # Obtener rutas existentes correctamente
        if estudiante.ruta_documentos:
            try:
                if isinstance(estudiante.ruta_documentos, str):
                    rutas_existentes = json.loads(estudiante.ruta_documentos)
                    if not isinstance(rutas_existentes, list):
                        rutas_existentes = []
                elif isinstance(estudiante.ruta_documentos, list):
                    rutas_existentes = estudiante.ruta_documentos
                else:
                    rutas_existentes = []
            except Exception:
                rutas_existentes = []
        else:
            rutas_existentes = []

        # Guardar los nuevos archivos
        nuevas_rutas = []
        for i, doc in enumerate(documentos):
            filename = f"doc_{estudiante_id}_{i}_{doc.filename}"
            full_path = os.path.join(UPLOAD_DIR, filename)
            with open(full_path, "wb") as f:
                f.write(await doc.read())
            nuevas_rutas.append(f"productiva/{filename}")

        # Combinar sin duplicados y mantener orden
        todas_rutas = list(dict.fromkeys(rutas_existentes + nuevas_rutas))

        # Guardar en la base
        estudiante.ruta_documentos = todas_rutas

    db.commit()
    db.refresh(estudiante)

    return estudiante

@router.delete("/{estudiante_id}")
def eliminar_estudiante(estudiante_id: int, db: Session = Depends(get_db)):
    return service.eliminar_estudiante(db, estudiante_id)

# 📂 Carpeta de subida
UPLOAD_DIR = "uploads/estudiantes"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/{estudiante_id}/upload")
async def subir_archivos(
    estudiante_id: int,
    foto: UploadFile = File(None),
    documentos: list[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    estudiante = db.query(Estudiantes).filter(Estudiantes.id == estudiante_id).first()
    if not estudiante:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")

    # Guardar foto
    if foto:
        filename = f"foto_{estudiante_id}_{foto.filename}"
        foto_path = f"estudiantes/{filename}"
        full_path = os.path.join(UPLOAD_DIR, filename)
        with open(full_path, "wb") as f:
            f.write(await foto.read())
        estudiante.ruta_foto = foto_path

    # Guardar documentos
    if documentos:
        # Obtener rutas existentes correctamente
        if estudiante.ruta_documentos:
            try:
                if isinstance(estudiante.ruta_documentos, str):
                    rutas_existentes = json.loads(estudiante.ruta_documentos)
                    if not isinstance(rutas_existentes, list):
                        rutas_existentes = []
                elif isinstance(estudiante.ruta_documentos, list):
                    rutas_existentes = estudiante.ruta_documentos
                else:
                    rutas_existentes = []
            except Exception:
                rutas_existentes = []
        else:
            rutas_existentes = []

        # Guardar los nuevos archivos
        nuevas_rutas = []
        for i, doc in enumerate(documentos):
            filename = f"doc_{estudiante_id}_{i}_{doc.filename}"
            full_path = os.path.join(UPLOAD_DIR, filename)
            with open(full_path, "wb") as f:
                f.write(await doc.read())
            nuevas_rutas.append(f"productiva/{filename}")

        # Combinar sin duplicados y mantener orden
        todas_rutas = list(dict.fromkeys(rutas_existentes + nuevas_rutas))

        # Guardar en la base
        estudiante.ruta_documentos = todas_rutas

    db.commit()
    db.refresh(estudiante)

    return {"message": "Archivos subidos correctamente", "estudiante_id": estudiante.id}

@router.delete("/{estudiante_id}/documentos")
def eliminar_documento(
    estudiante_id: int,
    filename: str = Query(..., description="Ruta del documento a eliminar"),
    db: Session = Depends(get_db),
):
    estudiante = db.query(Estudiantes).filter(Estudiantes.id == estudiante_id).first()
    if not estudiante:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")

    # Convertir en lista
    rutas = []
    if estudiante.ruta_documentos:
        try:
            rutas = (
                json.loads(estudiante.ruta_documentos)
                if isinstance(estudiante.ruta_documentos, str)
                else estudiante.ruta_documentos
            )
        except Exception:
            rutas = (
                estudiante.ruta_documentos.split(";")
                if isinstance(estudiante.ruta_documentos, str)
                else []
            )

    if filename not in rutas:
        raise HTTPException(status_code=404, detail="Documento no encontrado")

    file_path = os.path.join("uploads", filename)
    if os.path.exists(file_path):
        os.remove(file_path)

    rutas = [r for r in rutas if r != filename]
    estudiante.ruta_documentos = rutas
    db.commit()
    db.refresh(estudiante)

    return {"message": "Documento eliminado correctamente", "ruta_documentos": rutas}