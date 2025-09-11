from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import os
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
    estudiante = service.obtener_estudiante(db, estudiante_id)
    if not estudiante:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
    return estudiante

@router.put("/{estudiante_id}", response_model=EstudianteResponse)
def actualizar_estudiante(estudiante_id: int, datos: EstudianteUpdate, db: Session = Depends(get_db)):
    return service.actualizar_estudiante(db, estudiante_id, datos)

@router.delete("/{estudiante_id}")
def eliminar_estudiante(estudiante_id: int, db: Session = Depends(get_db)):
    return service.eliminar_estudiante(db, estudiante_id)

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
        foto_path = f"estudiantes/{filename}"   # relativo
        full_path = os.path.join(UPLOAD_DIR, filename)  # aquí sí va uploads/
        with open(full_path, "wb") as f:
            f.write(await foto.read())
        estudiante.ruta_foto = foto_path


    # Guardar documentos
    if documentos:
        rutas = []
        for i, doc in enumerate(documentos):
            filename = f"doc_{estudiante_id}_{i}_{doc.filename}"
            doc_path = os.path.join(UPLOAD_DIR, filename)
            with open(doc_path, "wb") as f:
                f.write(await doc.read())
            rutas.append(f"estudiantes/{filename}")
        estudiante.ruta_documentos = ";".join(rutas)

    db.commit()
    db.refresh(estudiante)

    return {"message": "Archivos subidos correctamente", "estudiante_id": estudiante.id}
