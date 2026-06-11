import sys
from pathlib import Path

# 确保 backend 目录在 Python 搜索路径中（解决 Railway 部署的导入问题）
sys.path.insert(0, str(Path(__file__).parent))

import json
from datetime import datetime, timezone
from typing import List

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy import select, func

from database import AsyncSessionLocal, init_db, dispose_db
from models import UserModel, PostModel
from schemas import UserCreateModel, UserLoginModel, UserResponseModel, Token,PostCreateModel, PostUpdateModel, PostResponseModel,ChatRequest, ChatResponse, ChatHistoryResponse
from auth import hash_password, verify_password, create_access_token, get_current_user
from agent import _build_agent, save_chat_message, get_chat_history


# ===== 应用生命周期 =====

from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    print("[OK] 数据库初始化完成")
    yield
    await dispose_db()
    print("[OK] 应用关闭，资源已清理")


app = FastAPI(
    title="待办事项 API",
    description="支持用户认证和文章管理的 RESTful API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===== 用户 =====

@app.post("/users", response_model=UserResponseModel, tags=["用户注册"])
async def register(user: UserCreateModel):
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(UserModel).where(UserModel.username == user.username)
        )
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="用户已存在")

        result = await session.execute(
            select(UserModel).where(UserModel.email == user.email)
        )
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="邮箱已存在")

        new_user = UserModel(
            username=user.username,
            email=user.email,
            hashed_password=hash_password(user.password),
        )
        session.add(new_user)
        await session.commit()
        await session.refresh(new_user)
        return new_user


@app.post("/auth/login", response_model=Token, tags=["用户登录"])
async def login(user_login: UserLoginModel):
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(UserModel).where(UserModel.username == user_login.username)
        )
        user = result.scalar_one_or_none()
        if user is None or not verify_password(user_login.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="用户名或密码错误")
        token = create_access_token(data={"sub": user.username})
        return {"access_token": token, "token_type": "bearer"}


# ===== 文章 =====

@app.post("/posts", response_model=PostResponseModel, tags=["创建文章"])
async def create_post(post: PostCreateModel, user: UserModel = Depends(get_current_user)):
    async with AsyncSessionLocal() as session:
        new_post = PostModel(
            title=post.title,
            content=post.content,
            is_public=post.is_public,
            user_id=user.id,
        )
        session.add(new_post)
        await session.commit()
        await session.refresh(new_post)
        return new_post


@app.get("/posts", response_model=List[PostResponseModel], tags=["查看所有文章"])
async def get_posts(user: UserModel = Depends(get_current_user)):
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(PostModel).where(PostModel.user_id == user.id)
        )
        return result.scalars().all()


@app.get("/posts/public", response_model=List[PostResponseModel], tags=["查看所有公开文章"])
async def get_public_posts(skip: int = 0, limit: int = 50):
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(PostModel)
            .where(PostModel.is_public == True)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()


@app.get("/posts/count", tags=["文章统计"])
async def get_posts_count(user: UserModel = Depends(get_current_user)):
    async with AsyncSessionLocal() as session:
        total = (
            await session.execute(
                select(func.count())
                .select_from(PostModel)
                .where(PostModel.user_id == user.id)
            )
        ).scalar()
        public = (
            await session.execute(
                select(func.count()).select_from(PostModel).where(
                    PostModel.user_id == user.id, PostModel.is_public == True
                )
            )
        ).scalar()
        return {"total": total, "public": public}


@app.get("/posts/search", response_model=List[PostResponseModel], tags=["搜索公开文章"])
async def search_posts(title: str, skip: int = 0, limit: int = 50):
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(PostModel)
            .where(PostModel.is_public == True)
            .where(PostModel.title.contains(title))
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()


@app.get("/posts/{post_id}", response_model=PostResponseModel, tags=["查看单个文章"])
async def get_post(post_id: int, user: UserModel = Depends(get_current_user)):
    async with AsyncSessionLocal() as session:
        post = await session.get(PostModel, post_id)
        if post is None:
            raise HTTPException(status_code=404, detail="文章不存在")
        if post.user_id != user.id:
            raise HTTPException(status_code=403, detail="无权访问")
        return post


@app.put("/posts/{post_id}", response_model=PostResponseModel, tags=["修改文章"])
async def update_post(
    post_id: int,
    ud_post: PostUpdateModel,
    user: UserModel = Depends(get_current_user),
):
    async with AsyncSessionLocal() as session:
        post = await session.get(PostModel, post_id)
        if post is None:
            raise HTTPException(status_code=404, detail="文章不存在")
        if post.user_id != user.id:
            raise HTTPException(status_code=403, detail="无权访问")

        if ud_post.title is not None:
            post.title = ud_post.title
        if ud_post.content is not None:
            post.content = ud_post.content
        if ud_post.is_public is not None:
            post.is_public = ud_post.is_public

        post.update_time = datetime.now(timezone.utc)
        await session.commit()
        await session.refresh(post)
        return post


@app.delete("/posts/{post_id}", tags=["删除文章"])
async def delete_post(post_id: int, user: UserModel = Depends(get_current_user)):
    async with AsyncSessionLocal() as session:
        post = await session.get(PostModel, post_id)
        if post is None:
            raise HTTPException(status_code=404, detail="文章不存在")
        if post.user_id != user.id:
            raise HTTPException(status_code=403, detail="无权访问")
        await session.delete(post)
        await session.commit()
        return {"message": "删除成功"}


# ===== AI 聊天 =====

@app.post("/chat", response_model=ChatResponse, tags=["AI聊天"])
async def chat(
    request: ChatRequest,
    current_user: UserModel = Depends(get_current_user),
):
    user_id = current_user.id
    await save_chat_message(user_id, "user", request.message)

    agent = _build_agent(user_id)
    response = await agent.ainvoke({"messages": request.message})
    result = response["messages"][-1].content
    await save_chat_message(user_id, "assistant", result)

    return ChatResponse(reply=result)


@app.post("/chat/stream", tags=["AI聊天"])
async def chat_stream(
    request: ChatRequest,
    current_user: UserModel = Depends(get_current_user),
):
    """流式 AI 聊天 — 以 SSE 格式逐 token 返回"""
    user_id = current_user.id
    await save_chat_message(user_id, "user", request.message)

    agent = _build_agent(user_id)

    async def generate():
        full_response = ""
        try:
            async for event in agent.astream_events(
                {"messages": request.message}, version="v2"
            ):
                kind = event.get("event")
                if kind == "on_chat_model_stream":
                    chunk = event["data"]["chunk"]
                    content = chunk.content
                    if content:
                        full_response += content
                        yield f"data: {json.dumps({'token': content})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        finally:
            if full_response:
                await save_chat_message(user_id, "assistant", full_response)
            yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@app.get("/chat/history", response_model=List[ChatHistoryResponse], tags=["AI聊天"])
async def get_chat_history_endpoint(
    current_user: UserModel = Depends(get_current_user),
):
    """获取当前用户的聊天记录"""
    return await get_chat_history(current_user.id)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
