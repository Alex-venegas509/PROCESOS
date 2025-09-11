# tests/test_user.py

import pytest
from fastapi.testclient import TestClient
from main import app  # Asegúrate de que app esté expuesto correctamente en main.py

client = TestClient(app)

# Puedes definir un usuario de prueba
test_user = {
    "username": "testuser",
    "email": "testuser@example.com",
    "password": "securepassword"
}

def test_register_user():
    response = client.post("/users/register", json=test_user)
    assert response.status_code in (200, 201)
    data = response.json()
    assert "id" in data
    assert data["email"] == test_user["email"]

def test_login_user():
    response = client.post("/auth/login", data={
        "username": test_user["email"],
        "password": test_user["password"]
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data

def test_get_user_info():
    # Login primero para obtener token
    login = client.post("/auth/login", data={
        "username": test_user["email"],
        "password": test_user["password"]
    })
    token = login.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.get("/users/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user["email"]
