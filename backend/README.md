<div align="center">

<img src="logo.png" width="120" height="auto" alt="记宝盒 Logo">

# 📦 记宝盒 后端(jbh-ucmao-backend)

**轻量化物品全生命周期管理后端系统**

[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE) [![Python Version](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/) [![MySQL](https://img.shields.io/badge/database-MySQL-orange.svg)](https://www.mysql.com/) [![Flask](https://img.shields.io/badge/framework-Flask%203.0-lightgrey.svg)](https://flask.palletsprojects.com/)

<p align="center">
<a href="#-立即体验">在线体验</a> •
<a href="#-核心业务逻辑">业务逻辑</a> •
<a href="#-快速开始">部署指南</a> •
<a href="[https://github.com/ucmao/jbh-ucmao-backend/issues](https://www.google.com/search?q=https://github.com/ucmao/jbh-ucmao-backend/issues)">提交Bug</a>
</p>

记宝盒是一款专为个人物品管理打造的后端服务系统。

通过“物品入库 -> 成本计算 -> 数据可视化 -> 报表导出”的链路，助你清晰掌握每一件物品的持有价值。

</div>

---

## 📱 立即体验

为了方便您快速了解系统功能，我们提供了微信小程序演示版与配套的前端项目：

* **🧩 小程序端（正式版）**：请扫描下方太阳码进行体验
* **🎨 前端源码**: [https://github.com/ucmao/jbh-ucmao-mp](https://github.com/ucmao/jbh-ucmao-mp)

<p align="center">
<img src="qr_code.jpg" width="200" alt="记宝盒太阳码">
</p>

> **协作提示**：本仓库仅提供后端 API 服务。如需构建完整应用，请配合上述前端仓库使用。

---

## 💎 核心业务逻辑

* **全生命周期追踪**：支持物品从“购入价格”到“退役残值”的全程记录，自动计算 **日均使用成本**。
* **微信生态集成**：原生对接微信小程序登录协议，实现用户无感化的身份认证与资源隔离。
* **智能数据资产化**：
* **统计报表**：自动聚合分类数据，生成用户物品价值统计报告。
* **一键导出**：支持将个人物品池导出为标准 CSV 格式，方便本地备份或进阶分析。


* **模块化 API 设计**：严格遵循 RESTful 规范，涵盖用户、物品、分类、统计及导出五个核心模块。

---

## 💾 核心模块矩阵

| 模块名称 | 功能描述 | 状态 |
| --- | --- | --- |
| **用户认证** | 微信小程序登录、OpenID 唯一标识提取 | ✅ 稳定 |
| **物品管理** | 增删改查、日均价格计算、分类图标匹配 | ✅ 稳定 |
| **统计中心** | 物品数量分布、资产价值统计报告 | ✅ 稳定 |
| **数据出口** | 用户数据 CSV 异步生成与下载 | ✅ 稳定 |
| **静态资源** | 多维度分类图标库（内置于 static 目录） | ✅ 完善 |

---

## 🔌 API 核心接口概览

**认证接口**：`POST /api/login` (参数：`code`)

| 功能模块 | 接口路径 | 请求方式 | 核心参数 |
| --- | --- | --- | --- |
| **分类列表** | `/api/items/categories` | `GET` | - |
| **物品添加** | `/api/items/add_item` | `POST` | `openid`, `purchase_price`等 |
| **我的物品** | `/api/items/user/<openid>` | `GET` | `openid` |
| **数据导出** | `/api/export/export-items/<openid>` | `GET` | `openid` |

---

## 🚀 快速开始

### 0. 环境要求

* **Python**: 3.8 及以上版本
* **MySQL**: 5.7 或 8.0+

### 1. 获取源码

```bash
git clone https://github.com/ucmao/jbh-ucmao-backend.git
cd jbh-ucmao-backend

```

### 2. 安装依赖

```bash
pip install -r requirements.txt

```

### 3. 环境配置 (.env)

复制 `.env.example` 为 `.env` 并配置您的环境变量：

```ini
# 微信小程序配置
WECHAT_APP_ID = your_appid_here
WECHAT_APP_SECRET = your_appsecret_here

# MYSQL 数据库配置
DB_HOST = localhost
DB_PORT = 3306
DB_NAME = ucmao_jbh
DB_USER = root
DB_PASSWORD = your_password_here

```

### 4. 初始化数据库

```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS ucmao_jbh CHARACTER SET utf8mb4;"
# 导入表结构
mysql -u root -p ucmao_jbh < schema.sql

```

### 5. 启动应用

**开发模式：**

```bash
python app.py

```

**生产模式 (Gunicorn)：**

```bash
gunicorn -w 4 -b 0.0.0.0:5007 app:app

```

---

## 💡 开发者必看：目录说明

```text
jbh-ucmao-backend/
├── api/                    # 路由层 (按业务模块划分子目录)
│   ├── items/              # 核心：物品管理逻辑
│   ├── login/              # 核心：微信认证逻辑
│   └── report/             # 核心：数据统计报表
├── configs/                # 配置文件 (常量与日志)
├── static/                 # 静态资源 (图标、默认图片)
├── app.py                  # 程序入口
├── requirements.txt        # 依赖列表
└── schema.sql              # 数据库初始化脚本

```

---

## 📩 联系作者

如果您在安装、使用过程中遇到问题，或有定制需求，请通过以下方式联系：

* **微信 (WeChat)**：csdnxr
* **QQ**：294323976
* **邮箱 (Email)**：leoucmao@gmail.com
* **Bug反馈**：[GitHub Issues](https://github.com/ucmao/jbh-ucmao-backend/issues)

---

## ⚖️ 开源协议 & 免责声明

1. 本项目基于 **[MIT LICENSE](LICENSE)** 协议开源。
2. **免责声明**：本项目主要用于学习交流。在使用导出等功能处理敏感财务数据时，请确保服务器环境的安全性。

**记宝盒** - 记录物品，留住生活。

---
