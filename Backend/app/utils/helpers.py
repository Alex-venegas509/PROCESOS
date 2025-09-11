from datetime import datetime
from passlib.context import CryptContext
import uuid

# Para hash de contraseñas (puede ir en auth también)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def generate_uuid() -> str:
    """Genera un UUID único en formato string."""
    return str(uuid.uuid4())

def get_current_datetime() -> str:
    """Devuelve la fecha y hora actual en formato ISO."""
    return datetime.utcnow().isoformat()

def capitalize_words(text: str) -> str:
    """Capitaliza cada palabra de una cadena de texto."""
    return ' '.join(word.capitalize() for word in text.split())