from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.auth.jwt_handler import jwt_handler
import jwt
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "mi_clave_secreta")

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Lista de rutas públicas que no requieren autenticación
        public_paths = [
            "/",
            "/docs",
            "/openapi.json",
            "/redoc",
            "/auth/login",
            "/auth/register",
            "/health",
            "/favicon.ico"
        ]
        
        # Rutas que pueden ser públicas durante desarrollo (opcional)
        development_paths = [
            "/usuarios/"
        ]
        
        # Obtener la ruta actual
        current_path = request.url.path
        
        # Verificar si es una ruta pública
        if any(current_path.startswith(path) for path in public_paths):
            return await call_next(request)
        
        # Durante desarrollo, puedes descomentar esta línea para hacer todas las rutas públicas
        # if any(current_path.startswith(path) for path in development_paths):
        #     return await call_next(request)
        
        # Verificar header de autorización
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=401, 
                content={
                    "detail": "Token no proporcionado",
                    "error": "MISSING_TOKEN"
                }
            )
        
        # Extraer el token
        token = auth_header.split(" ")[1]
        
        try:
            # Decodificar el token usando jwt directamente
            payload = jwt_handler(token, SECRET_KEY, algorithms=["HS256"])
            
            # Guardar información del usuario en el request state
            request.state.user = payload
            request.state.user_id = payload.get("sub")  # Subject normalmente contiene el user_id
            
            # También puedes usar la función personalizada si la prefieres
            # payload = decode_access_token(token)
            # if payload is None:
            #     return JSONResponse(
            #         status_code=401,
            #         content={
            #             "detail": "Token inválido o expirado",
            #             "error": "INVALID_TOKEN"
            #         }
            #     )
            
        except jwt.ExpiredSignatureError:
            return JSONResponse(
                status_code=401, 
                content={
                    "detail": "Token expirado",
                    "error": "EXPIRED_TOKEN"
                }
            )
        except jwt.InvalidTokenError:
            return JSONResponse(
                status_code=401, 
                content={
                    "detail": "Token inválido",
                    "error": "INVALID_TOKEN"
                }
            )
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={
                    "detail": "Error interno del servidor",
                    "error": "INTERNAL_ERROR"
                }
            )
        
        # Continuar con el request
        response = await call_next(request)
        
        # Opcional: Agregar headers de respuesta relacionados con auth
        response.headers["X-Authenticated"] = "true"
        
        return response