from passlib.context import CryptContext

# Usamos bcrypt que es un algoritmo fuerte y estándar
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Hashear una contraseña
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Verificar una contraseña en texto plano contra un hash
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
