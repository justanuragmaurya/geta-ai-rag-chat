from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refreshToken: str


class LogoutRequest(BaseModel):
    refreshToken: str | None = None


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    name: str | None = None


class AuthTokensResponse(BaseModel):
    accessToken: str
    refreshToken: str
    user: UserResponse


class RefreshTokensResponse(BaseModel):
    accessToken: str
    refreshToken: str


class MessageResponse(BaseModel):
    message: str
