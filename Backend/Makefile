# Variables
DOCKER_COMPOSE=docker-compose
PROJECT_NAME=fastapi_app

# Levanta la aplicación con Docker
up:
	$(DOCKER_COMPOSE) up --build

# Detiene los contenedores
down:
	$(DOCKER_COMPOSE) down

# Ejecuta bash en el contenedor del backend
bash:
	$(DOCKER_COMPOSE) exec backend /bin/bash

# Ejecuta migraciones si estás usando Alembic (opcional)
migrate:
	$(DOCKER_COMPOSE) exec backend alembic upgrade head

# Corre los tests
test:
	$(DOCKER_COMPOSE) exec backend pytest -v

# Reinicia solo el backend
restart:
	$(DOCKER_COMPOSE) restart backend

# Limpia contenedores, volúmenes e imágenes
clean:
	$(DOCKER_COMPOSE) down -v --rmi all --remove-orphans
