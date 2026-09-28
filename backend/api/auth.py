from fastapi import APIRouter, Depends, HTTPException

from core.security import get_current_researchflow_id
from schemas.auth import RegisterRequest, LoginRequest
from services.auth_service import register_user
from services.login_service import login_user
from database.user_repository import get_user_by_researchflow_id


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register")
def register(request: RegisterRequest):
    try:
        user = register_user(
            name=request.name,
            email=request.email,
            password=request.password,
        )

        return {
            "message": "Account created successfully",
            "user": user,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@router.post("/login")
def login(request: LoginRequest):
    try:
        result = login_user(
            researchflow_id=request.researchflow_id,
            password=request.password,
        )

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=401,
            detail=str(error),
        )

@router.get("/me")
def get_current_user(
    researchflow_id: str = Depends(get_current_researchflow_id),
):
    user = get_user_by_researchflow_id(researchflow_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return {
        "message": "Authentication successful",
        "user": {
            "name": user["name"],
            "email": user["email"],
            "researchflow_id": user["researchflow_id"],
        },
    }