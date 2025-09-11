from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer
from app.auth import jwt_handler

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/procesarLogin")

def get_current_user(token: str = Depends(oauth2_scheme)):
    return jwt_handler(token)

@router.get("/datos-protegidos")
def datos_protegidos(user: dict = Depends(get_current_user)):
    return {"mensaje": f"Hola {user['sub']}, eres {user['tipo']}"}