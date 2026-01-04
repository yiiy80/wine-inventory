from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone

SECRET_KEY = "wine-inventory-secret-key-change-in-production-2024"
ALGORITHM = "HS256"

# Create token
data = {"sub": 1}
expire = datetime.now(timezone.utc) + timedelta(hours=24)
to_encode = {"sub": 1, "exp": expire}
token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

print(f"Created token: {token}")

# Decode token
try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    print(f"Decoded payload: {payload}")
except JWTError as e:
    print(f"JWTError: {e}")
except Exception as e:
    print(f"Error: {type(e).__name__}: {e}")

# Try decoding the token from our test
test_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImV4cCI6MTc2NzUyOTE5OX0.Bhyex_b9GnfXt8mIdGMbzMRgtLo4nPP2ww9aZv-ZFO8"
print(f"\nDecoding test token...")
try:
    payload2 = jwt.decode(test_token, SECRET_KEY, algorithms=[ALGORITHM])
    print(f"Test token payload: {payload2}")
except JWTError as e:
    print(f"JWTError: {e}")
except Exception as e:
    print(f"Error: {type(e).__name__}: {e}")
