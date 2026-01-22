import os
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import bcrypt

# Import shared DB and Models
from database import get_db
from models import User

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
)  # 24 hours

# Initialize Passlib context for bcrypt
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def hash_password(password: str) -> str:
    """
    Hashes a plain text password and returns a UTF-8 string.
    """
    # 1. Convert plain text to bytes
    pwd_bytes = password.encode("utf-8")
    # 2. Generate a salt and hash the password -- A salt is a random string of data
    salt = bcrypt.gensalt()
    hashed_password_bytes = bcrypt.hashpw(pwd_bytes, salt)
    # 3. Decode the bytes to a string so SQLAlchemy can store it in a String() column
    return hashed_password_bytes.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain text password against a stored hash string.
    """
    try:
        # Convert the plain password and the stored hash string back to bytes
        password_byte_enc = plain_password.encode("utf-8")
        hashed_password_byte_enc = hashed_password.encode("utf-8")

        # bcrypt.checkpw requires (bytes, bytes)
        return bcrypt.checkpw(password_byte_enc, hashed_password_byte_enc)
    except Exception as e:
        print(f"Bcrypt verification failed: {e}")
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    """Get the current authenticated user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user
