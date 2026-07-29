from jose import jwt
import os
from dotenv import load_dotenv
import bcrypt

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")

def create_jwt(data):
    token = jwt.encode(data, JWT_SECRET, algorithm='HS256')
    return token

def verify_jwt(token):
    decoded = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
    return decoded

def hash_password(password):
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain, hashed):
    password_bytes = plain.encode('utf-8')
    if isinstance(hashed, str):
        hashed = hashed.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed)