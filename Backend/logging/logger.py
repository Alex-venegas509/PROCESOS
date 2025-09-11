import logging
from logging.handlers import RotatingFileHandler
import os

# Crear directorio si no existe
log_dir = "logs"
os.makedirs(log_dir, exist_ok=True)

# Configuración del logger principal
logger = logging.getLogger("app_logger")
logger.setLevel(logging.DEBUG)  # Puede ser INFO en producción

# Formato de log
formatter = logging.Formatter(
    "[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s", 
    datefmt="%Y-%m-%d %H:%M:%S"
)

# Handler para consola
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(formatter)

# Handler para archivo rotativo (limita tamaño)
file_handler = RotatingFileHandler(
    os.path.join(log_dir, "app.log"),
    maxBytes=5*1024*1024,  # 5 MB
    backupCount=3          # Mantener 3 archivos antiguos
)
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)

# Evita agregar múltiples veces los mismos handlers
if not logger.handlers:
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)
