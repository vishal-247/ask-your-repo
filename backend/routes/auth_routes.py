from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.user import User
from backend.utils.auth_utils import (
    hash_password,
    verify_password,
    create_access_token,
)
from backend.utils.auth_deps import get_current_user, require_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])


class UserAuthSchema(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=4)


class UserResponseSchema(BaseModel):
    id: int
    username: str


class AuthTokenResponseSchema(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponseSchema


@router.post("/register", response_model=AuthTokenResponseSchema)
def register(data: UserAuthSchema, db: Session = Depends(get_db)):
    clean_username = data.username.strip()

    if len(clean_username) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username must be at least 3 characters long."
        )

    # Check existing user
    existing_user = db.query(User).filter(User.username == clean_username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username is already taken. Please choose another."
        )

    # Create new user
    hashed = hash_password(data.password)
    new_user = User(username=clean_username, password_hash=hashed)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate JWT
    token = create_access_token({"sub": new_user.username, "user_id": new_user.id})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "username": new_user.username,
        }
    }


@router.post("/login", response_model=AuthTokenResponseSchema)
def login(data: UserAuthSchema, db: Session = Depends(get_db)):
    clean_username = data.username.strip()

    user = db.query(User).filter(User.username == clean_username).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password."
        )

    token = create_access_token({"sub": user.username, "user_id": user.id})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
        }
    }


@router.get("/me", response_model=UserResponseSchema)
def get_me(current_user: User = Depends(require_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
    }
