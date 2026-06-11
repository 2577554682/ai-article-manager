from langchain_openai import ChatOpenAI

from config import MODEL, BASE_URL, API_KEY

llm = ChatOpenAI(
    model=MODEL,
    temperature=0,
    base_url=BASE_URL,
    api_key=API_KEY,
)
