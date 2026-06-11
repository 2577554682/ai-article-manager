from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field, ConfigDict


# ===== 用户 =====

class UserCreateModel(BaseModel):
    username: str = Field(..., min_length=2, max_length=10)
    email: str = Field(..., min_length=5, max_length=17)
    password: str = Field(..., min_length=5, max_length=16)


class UserLoginModel(BaseModel):
    username: str = Field(..., min_length=2, max_length=10)
    password: str = Field(..., min_length=5, max_length=16)


class UserResponseModel(BaseModel):
    id: int
    username: str
    email: str
    create_time: datetime
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ===== 文章 =====

class PostResponseModel(BaseModel):
    id: int
    title: str
    content: str
    is_public: bool
    create_time: datetime | None = None
    update_time: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


class PostCreateModel(BaseModel):
    title: str
    content: str
    is_public: bool = True


class PostUpdateModel(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_public: Optional[bool] = None


# ===== AI 聊天 =====

class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str
    model_config = ConfigDict(from_attributes=True)


class ChatHistoryResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
