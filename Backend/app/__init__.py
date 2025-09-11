from fastapi import FastAPI
from app.controllers.login_routes import router as api_router

app = FastAPI()

app.include_router(api_router)