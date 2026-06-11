import os
from pathlib import Path
from dotenv import load_dotenv

# 使用 config.py 自身路径定位 .env（兼容 Railway 部署）
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
DATABASE_URL = os.getenv("DATABASE_URL")

API_KEY = os.getenv("API_KEY")
BASE_URL = os.getenv("BASE_URL")
MODEL = os.getenv("MODEL")
