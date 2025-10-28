import os
import json
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.estudiantes import Estudiantes
from app.schemas.estudiantes_shemas import EstudianteCreate, EstudianteUpdate

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads", "estudiantes")

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
    estudiante = (
        db.query(Estudiantes)
        .order_by(Estudiantes.id.asc())  # Orden fijo
        .offset(skip)
        .limit(limit)
        .all()
    )

    for est in estudiante:
        if est.ruta_documentos:
            try:
                est.ruta_documentos = json.loads(est.ruta_documentos)
            except:
                est.ruta_documentos = []
    return estudiante

def obtener_estudiante(db: Session, estudiante_id: int):
    estudiante = db.query(Estudiantes).filter(Estudiantes.id == estudiante_id).first()
    if not estudiante:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")

    if estudiante.ruta_documentos:
        try:
            estudiante.ruta_documentos = json.loads(estudiante.ruta_documentos)
        except:
            estudiante.ruta_documentos = []
    return estudiante


def actualizar_estudiante(db: Session, estudiante_id: int, datos, foto=None, documentos=None):
    estudiante = db.query(Estudiantes).filter(Estudiantes.id == estudiante_id).first()
    if not estudiante:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")

    # Actualizar campos básicos
    campos = [
        "nombres", "apellidos", "tipo_identificacion", "identificacion", "correo", 
        "correo_institucional", "direccion", "celular",  "telefono", "ficha", "tipo_documento",
    ]
    for campo in campos:
        if hasattr(datos, campo):
            setattr(estudiante, campo, getattr(datos, campo))

    # Actualizar foto
    if foto:
        estudiante.ruta_foto = guardar_archivo(foto)

    # Actualizar documentos
        # Actualizar documentos
    if documentos:
        rutas_existentes = []
        if estudiante.ruta_documentos:
            try:
                # Si ya está en formato JSON (string), parsearlo una sola vez
                rutas_existentes = json.loads(estudiante.ruta_documentos)
                # Si accidentalmente está doblemente serializado, corregirlo
                if isinstance(rutas_existentes, str):
                    rutas_existentes = json.loads(rutas_existentes)
            except:
                rutas_existentes = []

        nuevas_rutas = [guardar_archivo(d) for d in documentos]
        todas = list(set(rutas_existentes + nuevas_rutas))

        # ✅ Guardar como JSON solo una vez
        estudiante.ruta_documentos = json.dumps(todas)

    db.commit()
    db.refresh(estudiante)

    try:
        estudiante.ruta_documentos = json.loads(estudiante.ruta_documentos or "[]")
    except:
        estudiante.ruta_documentos = []

    return estudiante

def eliminar_estudiante(db: Session, estudiante_id: int):
    estudiante = db.query(Estudiantes).filter(Estudiantes.id == estudiante_id).first()
    if not estudiante:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")

    def normalizar_ruta(ruta: str):
        """Quita 'estudiantes/' si ya viene en la BD"""
        ruta = ruta.strip().strip('"').strip("'")
        if ruta.startswith("estudiantes/"):
            ruta = ruta.replace("estudiantes/", "", 1)
        return os.path.join(UPLOAD_DIR, ruta)

    # 🖼 Foto
    if estudiante.ruta_foto:
        foto_path = normalizar_ruta(estudiante.ruta_foto)
        print("🖼 Intentando eliminar foto:", foto_path)
        if os.path.exists(foto_path):
            os.remove(foto_path)
            print("✅ Foto eliminada:", foto_path)
        else:
            print("⚠️ Foto no encontrada:", foto_path)

    # 📄 Documentos
    if estudiante.ruta_documentos:
        rutas = []
        try:
            rutas = json.loads(estudiante.ruta_documentos)  # ✅ ahora sí parsea JSON
        except Exception as e:
            print("⚠️ No se pudo parsear JSON, usando split:", e)
            rutas = estudiante.ruta_documentos.split(",")

        for ruta in rutas:
            doc_path = normalizar_ruta(ruta)
            print("📄 Intentando eliminar documento:", doc_path)
            if os.path.exists(doc_path):
                os.remove(doc_path)
                print("✅ Documento eliminado:", doc_path)
            else:
                print("⚠️ Documento no encontrado:", doc_path)

    # 🔹 Finalmente eliminar de la BD
    db.delete(estudiante)
    db.commit()

    return {"message": "Estudiante y archivos eliminados correctamente"}
