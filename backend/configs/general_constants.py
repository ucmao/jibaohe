import os
import sqlite3
from dotenv import load_dotenv

# 加载.env文件
load_dotenv()

# 项目根目录
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 图标文件路径
ICONS_DIR = os.path.join(BASE_DIR, 'static', 'icons')

# 微信配置
WECHAT_APP_ID = os.getenv('WECHAT_APP_ID')
WECHAT_APP_SECRET = os.getenv('WECHAT_APP_SECRET')

# 基础URL
BASE_URL = os.getenv('BASE_URL')

# SQLite 数据库文件路径
DB_PATH = os.path.join(BASE_DIR, 'jibaohe.db')


def get_db_connection():
    """获取 SQLite 数据库连接，返回字典模式的 row_factory"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn
