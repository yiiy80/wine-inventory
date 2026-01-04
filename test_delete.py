import requests

# Login
resp = requests.post("http://localhost:8000/api/auth/login", json={
    "email": "admin@wine.com",
    "password": "admin123",
    "remember_me": False
})
token = resp.json()['access_token']
headers = {"Authorization": f"Bearer {token}"}

# Create wine
resp = requests.post("http://localhost:8000/api/wines", json={
    "name": "测试删除",
    "vintage_year": 2020,
    "region": "测试",
    "current_stock": 10,
    "low_stock_threshold": 5
}, headers=headers)
print(f"Create wine: {resp.status_code}")
wine_id = resp.json()['id']

# Delete wine
resp = requests.delete(f"http://localhost:8000/api/wines/{wine_id}", headers=headers)
print(f"Delete wine: {resp.status_code}")
print(f"Response body: {resp.text}")
print(f"Expected status: 204")
