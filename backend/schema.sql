-- SQLite 数据库结构
-- 极保和 (jibaohe) - SQLite 版本

PRAGMA foreign_keys = ON;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    openid     TEXT    NOT NULL UNIQUE,
    username   TEXT    DEFAULT NULL,
    avatar     TEXT    DEFAULT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    deleted_at TEXT    DEFAULT NULL
);

-- 物品清单表
CREATE TABLE IF NOT EXISTS items (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id          INTEGER NOT NULL,
    category         TEXT    DEFAULT NULL,
    item_image       TEXT    DEFAULT NULL,
    item_name        TEXT    NOT NULL,
    purchase_date    TEXT    DEFAULT NULL,
    purchase_price   REAL    DEFAULT NULL,
    use_count_value  INTEGER DEFAULT NULL,
    daily_price      REAL    DEFAULT NULL,
    retirement_date  TEXT    DEFAULT NULL,
    retirement_price REAL    DEFAULT NULL,
    description      TEXT    DEFAULT NULL,
    is_favorite      INTEGER DEFAULT 0,
    created_at       TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at       TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    deleted_at       TEXT    DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- updated_at 自动更新触发器（users）
CREATE TRIGGER IF NOT EXISTS update_users_updated_at
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    UPDATE users SET updated_at = datetime('now', 'localtime') WHERE id = OLD.id;
END;

-- updated_at 自动更新触发器（items）
CREATE TRIGGER IF NOT EXISTS update_items_updated_at
AFTER UPDATE ON items
FOR EACH ROW
BEGIN
    UPDATE items SET updated_at = datetime('now', 'localtime') WHERE id = OLD.id;
END;