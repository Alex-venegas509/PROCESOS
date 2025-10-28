from fastapi import FastAPI, Form, Request, Response
from database.db import Base, engine
from fastapi.middleware.cors import CORSMiddleware
from app.controllers import (
    login_routes, protected_routes, usuarios_routes, tipo_usuarios_routes,
    password_resets_routes, estudiantes_routes, novedades_routes,
    certificacion_routes, instructores_routes, productiva_routes, seguimiento_routes
)
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Backend API", version="1.0.0")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluyendo routers
app.include_router(login_routes.router, prefix="/api/login", tags=["Login"])
app.include_router(protected_routes.router, prefix="/api/proteccion", tags=["Protegido"])
app.include_router(usuarios_routes.router, prefix="/api/usuarios", tags=["usuarios"])
app.include_router(tipo_usuarios_routes.router, prefix="/api/tipo_usuarios", tags=["tipo_usuarios"])
app.include_router(password_resets_routes.router, prefix="/api/password", tags=["password"])
app.include_router(estudiantes_routes.router, prefix="/api/estudiantes", tags=["estudiantes"])
app.include_router(novedades_routes.router, prefix="/api/novedades", tags=["novedades"])
app.include_router(certificacion_routes.router, prefix="/api/certificacion", tags=["certificacion"])
app.include_router(instructores_routes.router, prefix="/api/instructores", tags=["instructores"])
app.include_router(productiva_routes.router, prefix="/api/productiva", tags=["productiva"])
app.include_router(seguimiento_routes.router, prefix="/api/seguimiento", tags=["seguimiento"])

# Montar carpeta de archivos subidos
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Middleware para evitar cache en uploads
@app.middleware("http")
async def no_cache_uploads(request: Request, call_next):
    response: Response = await call_next(request)
    if request.url.path.startswith("/uploads/"):
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
    return response

@app.get("/")
def read_root():
    return {"message": "Backend corriendo correctamente"}

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse("app/static/favicon.ico")
