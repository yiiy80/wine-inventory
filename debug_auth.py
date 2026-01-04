import requests
import sys

# Login
resp = requests.post("http://localhost:8000/api/auth/login", json={
    "email": "admin@wine.com",
    "password": "admin123",
    "remember_me": False
})
print(f"Login: {resp.status_code}")
data = resp.json()
token = data['access_token']
print(f"Token: {token}")
print(f"User: {data['user']}")

# Test with different header formats
print("\n--- Testing different header formats ---")

# Format 1: Authorization: Bearer <token>
headers1 = {"Authorization": f"Bearer {token}"}
resp1 = requests.get("http://localhost:8000/api/auth/me", headers=headers1)
print(f"1. Authorization: Bearer <token> => {resp1.status_code}")
if resp1.status_code != 200:
    print(f"   Response: {resp1.text}")

# Format 2: With Content-Type
headers2 = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}
resp2 = requests.get("http://localhost:8000/api/auth/me", headers=headers2)
print(f"2. With Content-Type => {resp2.status_code}")
if resp2.status_code != 200:
    print(f"   Response: {resp2.text}")

# Let's check what FastAPI expects
print("\n--- Testing with requests session ---")
session = requests.Session()
session.headers.update({"Authorization": f"Bearer {token}"})
resp3 = session.get("http://localhost:8000/api/auth/me")
print(f"3. Using session => {resp3.status_code}")
if resp3.status_code != 200:
    print(f"   Response: {resp3.text}")

# Try the docs endpoint to see if there's an issue
print("\n--- Checking API docs ---")
resp4 = requests.get("http://localhost:8000/docs")
print(f"Docs available: {resp4.status_code == 200}")

# Check health endpoint
resp5 = requests.get("http://localhost:8000/api/health")
print(f"Health check: {resp5.status_code} - {resp5.json()}")
