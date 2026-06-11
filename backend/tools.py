from datetime import datetime, timezone

from langchain.tools import tool
from sqlalchemy import select

from database import AsyncSessionLocal
from models import PostModel


async def _list_all_user_posts(user_id: int) -> str:
    """列出指定用户的所有文章，包含标题、公开状态和创建日期。

    从数据库中查询属于该用户的全部文章，按可读格式拼接返回。
    如果用户没有任何文章，返回友好提示。

    Args:
        user_id: 当前登录用户的唯一标识符。

    Returns:
        格式化后的文章列表字符串。每行一篇文章，包含标题、公开/私密状态
        和创建日期。无文章时返回"你目前没有任何文章"。
    """
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(PostModel).where(PostModel.user_id == user_id)
        )
        posts = result.scalars().all()
        if not posts:
            return "你目前没有任何文章"

        post_list = []
        for post in posts:
            status = "公开" if post.is_public else "私密"
            post_list.append(
                f"  《{post.title}》| {status} | "
                f"创建于{post.create_time.strftime('%Y-%m-%d')}"
            )
        return "你的文章列表：\n" + "\n".join(post_list)


@tool
async def ai_get_user_posts(user_id: int) -> str:
    """获取当前用户的所有文章。

    当用户询问"我的文章"、"查看文章"、"列出文章"时调用此工具。
    内部调用 _list_all_user_posts 完成查询和格式化。

    Args:
        user_id: 当前登录用户的唯一标识符，由系统自动传入。

    Returns:
        格式化后的文章列表字符串。无文章时返回"暂无文章"。
    """
    return await _list_all_user_posts(user_id)


@tool
async def ai_create_posts(
    title: str, content: str, user_id: int, is_public: bool = True
) -> str:
    """创建一篇新文章并写入数据库。

    当用户说"写文章"、"创建文章"、"发布文章"时调用此工具。
    文章默认设为公开，除非用户明确要求私密。

    Args:
        title: 文章标题，从用户输入中提取，必填。
        content: 文章正文内容，从用户输入中提取，必填。
        user_id: 当前登录用户的唯一标识符，由系统自动传入。
        is_public: 是否公开，默认 True。用户说"私密"时设为 False。

    Returns:
        创建成功的确认消息，格式为"✅ 文章《{title}》创建成功"。
    """
    async with AsyncSessionLocal() as session:
        post = PostModel(
            title=title, content=content, user_id=user_id, is_public=is_public
        )
        session.add(post)
        await session.commit()
        await session.refresh(post)
        return f"✅ 文章《{title}》创建成功"


@tool
async def ai_delete_post(user_id: int, title: str) -> str:
    """根据标题修改文章。此工具只需要文章标题，不需要文章ID，不需要用户确认，立即执行修改。

    当用户说"修改XX"、"把XX改成XX"时，立刻调用此工具。
    直接用用户提供的标题去数据库精确匹配当前用户的文章并修改。

    Args:
        user_id: 当前登录用户的唯一标识符，系统自动传入。
        title: 要修改的文章标题，必须与数据库中的标题完全一致。
        new_title: 新标题，可选。
        new_content: 新内容，可选。
        is_public: 是否公开，可选。True=公开，False=私密。

    Returns:
        修改成功时返回"✅ 文章《{title}》更新成功"。
        找不到时返回错误提示和用户的所有文章列表。
    """
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(PostModel).where(
                PostModel.user_id == user_id, PostModel.title == title
            )
        )
        post = result.scalar_one_or_none()

        if post is None:
            all_posts = await _list_all_user_posts(user_id)
            return (
                f"❌ 没有找到标题为《{title}》的文章。\n\n"
                f"{all_posts}\n\n"
                f"请检查标题是否输入正确（标题需要完全一致）。"
            )

        await session.delete(post)
        await session.commit()
        return f"✅ 文章《{title}》已删除"


@tool
async def ai_update_post(
    user_id: int,
    title: str,
    new_title: str | None = None,
    new_content: str | None = None,
    is_public: bool | None = None,
) -> str:
    """根据标题修改文章。此工具只需要文章标题，不需要文章ID，不需要用户确认，立即执行修改。"""
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(PostModel).where(
                PostModel.user_id == user_id, PostModel.title == title
            )
        )
        post = result.scalar_one_or_none()

        if post is None:
            all_posts = await _list_all_user_posts(user_id)
            return (
                f"❌ 没有找到标题为《{title}》的文章。\n\n"
                f"{all_posts}\n\n"
                f"请检查标题是否输入正确（标题需要完全一致）。"
            )

        if new_title is not None and new_title.strip():
            post.title = new_title.strip()
        if new_content is not None and new_content.strip():
            post.content = new_content.strip()
        if is_public is not None:
            post.is_public = is_public

        post.update_time = datetime.now(timezone.utc)
        await session.commit()
        await session.refresh(post)
        return f"✅ 文章《{post.title}》更新成功"
