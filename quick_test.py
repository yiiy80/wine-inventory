import requests

# Login
resp = requests.post("http://localhost:8000/api/auth/login", json={
    "email": "admin@wine.com",
    "password": "admin123",
    "remember_me": False
})
print(f"Login: {resp.status_code}")
token = resp.json()['access_token']
print(f"Token: {token[:50]}...")

# Test /auth/me
headers = {"Authorization": f"Bearer {token}"}
resp2 = requests.get("http://localhost:8000/api/auth/me", headers=headers)
print(f"\n/auth/me: {resp2.status_code}")
print(f"Response: {resp2.text[:200]}")

# Test /wines
resp3 = requests.get("http://localhost:8000/api/wines", headers=headers)
print(f"\n/wines: {resp3.status_code}")
print(f"Response: {resp3.text[:200]}")
