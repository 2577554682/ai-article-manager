from datetime import datetime, timezone
from sqlalchemy import select

from database import AsyncSessionLocal
from models import ChatHistoryModel

async def save_chat_message(user_id: int, role: str, content: str):
    """保存聊天记录"""
    async with AsyncSessionLocal() as session:
        msg = ChatHistoryModel(user_id=user_id, role=role, content=content)
        session.add(msg)
        await session.commit()
        await session.refresh(msg)


async def get_chat_history(user_id: int, limit: int = 20):
    """获取聊天记录"""
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(ChatHistoryModel)
            .where(ChatHistoryModel.user_id == user_id)
            .order_by(ChatHistoryModel.created_at.asc())
            .limit(limit)
        )
        return result.scalars().all()


def _build_agent(user_id: int):
    """构建文章管理 Agent，供 /chat 和 /chat/stream 共用"""
    from langchain.agents import create_agent
    from llm import llm
    import tools

    return create_agent(
        llm,
        tools=[tools.ai_get_user_posts, tools.ai_create_posts, tools.ai_update_post, tools.ai_delete_post],
        system_prompt=f"""你是文章管理系统助手。当前用户ID是 {user_id}。

                        【你必须遵守的铁律】
                        1. 用户说删除 → 立刻调用 ai_delete_post，传 title 参数。不要问ID，不要确认，直接删。
                        2. 用户说修改 → 立刻调用 ai_update_post，传 title 参数。不要问ID，不要确认，直接改。
                        3. 用户说查看 → 立刻调用 ai_get_user_posts。
                        4. 用户说创建 → 立刻调用 ai_create_posts。
                        
                        【提取标题的规则】
                        直接从用户的话里提取文章标题，去掉"删除"、"标题为"、"我的"、"的文章"等修饰词：
                        - "删除Python编程入门" → title="Python编程入门"
                        - "删除标题为Python编程入门的文章" → title="Python编程入门"
                        
                        【错误处理】
                        如果工具返回"找不到"，把工具返回的文章列表展示给用户，让用户提供准确标题。
                        
                        【严禁】
                        ❌ 禁止说"请提供文章ID"
                        ❌ 禁止说"确定要删除吗？"
                        ❌ 禁止等待用户确认
                        ❌ 禁止编造结果
                        
                        当前时间：{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')}
                        如果用户问与文章无关的问题，可以正常聊天。
                        """,
    )
