#!/usr/bin/env python3
"""
init_db.py - 初始化 SQLite 数据库
运行方式：python init_db.py
"""
import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'jibaohe.db')
SCHEMA_PATH = os.path.join(BASE_DIR, 'schema.sql')


def init_db():
    if os.path.exists(DB_PATH):
        print(f"[!] 数据库已存在：{DB_PATH}")
        confirm = input("    是否重新初始化？这将清空所有数据！(y/N): ").strip().lower()
        if confirm != 'y':
            print("[✓] 已取消，数据库未更改。")
            return

    with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
        schema = f.read()

    conn = sqlite3.connect(DB_PATH)
    conn.executescript(schema)
    conn.commit()
    conn.close()

    print(f"[✓] 数据库初始化成功：{DB_PATH}")


if __name__ == '__main__':
    init_db()
