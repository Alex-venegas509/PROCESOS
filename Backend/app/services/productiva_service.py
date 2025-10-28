import os
import json
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.productiva import Productiva
from app.schemas.productiva_shemas import ProductivaCreate, ProductivaUpdate

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads", "productiva")

def crear_etapaProductiva(db: Session, productiva: ProductivaCreate):
    db_productiva = db.query(Productiva).filter(Productiva.identificacion == productiva.identificacion).first()
    if db_productiva:
        raise HTTPException(status_code=400, detail="Identificación ya registrada")

    nuevo_productiva = Productiva(**productiva.model_dump())
    db.add(nuevo_productiva)
    db.commit()
    db.refresh(nuevo_productiva)
    return nuevo_productiva

def listar_etapaProductiva(db: Session, skip: int = 0, limit: int = 100):
    productivas = (
        db.query(Productiva)
        .order_by(Productiva.id.asc())  # Orden fijo
        .offset(skip)
        .limit(limit)
        .all()
    )

    for prod in productivas:
        if prod.ruta_documentos:
            try:
                prod.ruta_documentos = json.loads(prod.ruta_documentos)
            except:
                prod.ruta_documentos = []
    return productivas


def obtener_etapaProductiva(db: Session, productiva_id: int):
    productiva = db.query(Productiva).filter(Productiva.id == productiva_id).first()
    if not productiva:
        raise HTTPException(status_code=404, detail="Etapa productiva no encontrada")

    if productiva.ruta_documentos:
        try:
            productiva.ruta_documentos = json.loads(productiva.ruta_documentos)
        except:
            productiva.ruta_documentos = []
    return productiva

def actualizar_etapaProductiva(db: Session, productiva_id: int, datos, documentos=None):
    productiva = db.query(Productiva).filter(Productiva.id == productiva_id).first()
    if not productiva:
        raise HTTPException(status_code=404, detail="Etapa productiva no encontrada")

    # Actualizar campos básicos
    campos = [
        "discapacidad", "cual_discapacidad", "tipo_documento",
    ]
    for campo in campos:
        if hasattr(datos, campo):
            setattr(productiva, campo, getattr(datos, campo))

    # Actualizar documentos
        # Actualizar documentos
    if documentos:
        rutas_existentes = []
        if productiva.ruta_documentos:
            try:
                # Si ya está en formato JSON (string), parsearlo una sola vez
                rutas_existentes = json.loads(productiva.ruta_documentos)
                # Si accidentalmente está doblemente serializado, corregirlo
                if isinstance(rutas_existentes, str):
                    rutas_existentes = json.loads(rutas_existentes)
            except:
                rutas_existentes = []

        nuevas_rutas = [guardar_archivo(d) for d in documentos]
        todas = list(set(rutas_existentes + nuevas_rutas))

        # ✅ Guardar como JSON solo una vez
        productiva.ruta_documentos = json.dumps(todas)

    db.commit()
    db.refresh(productiva)

    try:
        productiva.ruta_documentos = json.loads(productiva.ruta_documentos or "[]")
    except:
        productiva.ruta_documentos = []

    return productiva

def eliminar_etapaProductiva(db: Session, productiva_id: int):
    productiva = db.query(Productiva).filter(Productiva.id == productiva_id).first()
    if not productiva:
        raise HTTPException(status_code=404, detail="Etapa productiva no encontrada")

    def normalizar_ruta(ruta: str):
        """Convierte la ruta guardada en BD a una ruta absoluta válida.
           Devuelve None si la ruta es inválida/está vacía."""
        if not ruta:
            return None
        ruta = ruta.strip().strip('"').strip("'")
        if ruta.startswith("productiva/"):
            ruta = ruta.replace("productiva/", "", 1)
        # Evita que la ruta final sea una carpeta vacía
        ruta = ruta.strip()
        if not ruta:
            return None
        return os.path.join(UPLOAD_DIR, ruta)

    # 📄 Documentos: parsear JSON o fallback a splits
    rutas = []
    if productiva.ruta_documentos:
        try:
            rutas = json.loads(productiva.ruta_documentos)
            # Si por algún motivo JSON devuelve una str en vez de lista
            if isinstance(rutas, str):
                rutas = [rutas]
            # si es None u otro tipo, forzamos lista vacía
            if not isinstance(rutas, list):
                rutas = list(rutas) if hasattr(rutas, "__iter__") else []
        except Exception as e:
            # fallback: intentar split por ; o , y limpiar espacios
            raw = productiva.ruta_documentos if isinstance(productiva.ruta_documentos, str) else ""
            sep = ";" if ";" in raw else ","
            rutas = [r.strip() for r in raw.split(sep) if r.strip()]
            print("⚠️ No se pudo parsear JSON, usando split. Error:", e)

    for ruta in rutas:
        doc_path = normalizar_ruta(ruta)
        if not doc_path:
            print(f"⚠️ Ruta inválida/ vacía: {ruta!r} — se omite")
            continue

        # Verificar que exista y sea archivo (no carpeta)
        if os.path.isfile(doc_path):
            try:
                os.remove(doc_path)
                print(f"✅ Documento eliminado: {doc_path}")
            except PermissionError:
                print(f"⚠️ Permiso denegado al eliminar: {doc_path} -- se omite")
            except Exception as ex:
                print(f"⚠️ Error al eliminar {doc_path}: {ex}")
        else:
            # si existe pero no es archivo, lo informamos; si no existe, también
            if os.path.exists(doc_path):
                print(f"⚠️ La ruta existe pero no es un archivo: {doc_path} -- se omite")
            else:
                print(f"⚠️ Documento no encontrado (salteado): {doc_path}")

    # 🔹 Finalmente eliminar el registro de la BD
    db.delete(productiva)
    db.commit()

    return {"message": "Etapa productiva y archivos eliminados correctamente"}
