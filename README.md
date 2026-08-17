<div align="center">

<img src="images/logo.png" width="120" height="auto" alt="记宝盒 Logo">

# 📦 记宝盒 (jibaohe)

**轻量化个人资产物品管理微信小程序**

[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE) [![Platform](https://img.shields.io/badge/platform-微信小程序-brightgreen.svg)](https://mp.weixin.qq.com/) [![JS](https://img.shields.io/badge/language-JavaScript-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript) [![Status](https://img.shields.io/badge/status-stable-green.svg)](#-核心功能逻辑)

<p align="center">
<a href="#-立即体验">立即体验</a> •
<a href="#-核心功能逻辑">功能逻辑</a> •
<a href="#-快速开始">部署指南</a> •
<a href="https://github.com/ucmao/jibaohe/issues">提交 Bug</a>
</p>

记宝盒是一款专为个人和家庭打造的**资产全生命周期管理**小程序。

通过简洁的交互界面，助你轻松记录从购入到退役的每一件物品，实现资产价值的量化管理。

</div>

---

## 📱 立即体验

欢迎扫码体验本项目的实际功能和效果：

* **🧩 小程序端**：请扫描下方太阳码进行体验

<p align="center">
<img src="qr_code.jpg" width="200" alt="记宝盒太阳码">
</p>

---

## 💎 核心功能逻辑

* **全生命周期记录**：涵盖资产名称、分类、购买价格、日期，直至退役日期与残值的完整链条。
* **价值量化统计**：
  * **使用统计**：支持记录预计使用次数或自动计算 **日均持有价格**。
  * **可视化报表**：直观展示资产分布与价值比例，让财务决策更有据可依。


* **极简交互体验**：
  * **原生性能**：基于微信原生框架开发，适配各种屏幕尺寸，运行流畅。
  * **快捷搜索**：支持关键词搜索与分类筛选，快速定位目标资产。


* **数据安全与分享**：支持重要资产收藏，并可一键分享资产卡片给好友。

---

## 💾 技术栈

| 维度 | 技术选型 | 说明 |
| --- | --- | --- |
| **前端框架** | 微信小程序原生框架 | 保证最佳的运行性能与稳定性 |
| **前端语言** | JavaScript | 标准小程序开发语言 |
| **网络请求** | `wx.request` | 封装标准 API 调用 |
| **本地缓存** | `wx.setStorageSync` | 本地缓存优化，提升加载速度 |
| **UI 组件** | 原生组件 | 保持系统一致的交互视觉体验 |
| **后端框架** | Flask (Python) | 轻量 REST API 服务 |
| **数据库** | SQLite | 零配置嵌入式数据库，开箱即用 |

---

## 🔌 配置说明

**前端配置路径**：`utils/config.js`

在使用前，请参考 `utils/config.example.js` 创建配置文件，并修改以下核心项：

| 配置项 | 描述 | 示例值 |
| --- | --- | --- |
| `domain` | API 请求域名 | `https://your-domain.com` |
| `appName.full` | 应用全称 | `记宝盒` |
| `apiPath.login` | 登录接口路径 | `/api/login` |
| `staticPath` | 默认分享图路径 | `/static/default/share-image.jpg` |

**后端配置路径**：`backend/.env`

参考 `backend/.env.example` 创建后端配置文件：

| 配置项 | 描述 |
| --- | --- |
| `BASE_URL` | 服务器访问地址，如 `http://localhost:5007` |
| `WECHAT_APP_ID` | 微信小程序 AppID |
| `WECHAT_APP_SECRET` | 微信小程序 AppSecret |

---

## 🚀 快速开始

### 前端（小程序）

#### 1. 环境准备

* 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)。
* 准备一个微信小程序开发者账号。

#### 2. 获取源码与配置

```bash
# 克隆项目
git clone https://github.com/ucmao/jibaohe.git
cd jibaohe

# 初始化前端配置
cp utils/config.example.js utils/config.js
```

#### 3. 导入项目

1. 打开 **微信开发者工具**。
2. 选择 **「导入项目」**，选择克隆的目录。
3. 填写你的 **AppID**，点击导入。

#### 4. 预览运行

点击工具上方的 **「编译」** 按钮，即可在模拟器中看到运行效果。

---

### 后端（Flask + SQLite）

#### 1. 初始化环境

```bash
cd jibaohe/backend

# 创建并激活虚拟环境
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

#### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env，填写微信 AppID、AppSecret 和 BASE_URL
```

#### 3. 初始化数据库

```bash
python init_db.py
```

#### 4. 启动服务

```bash
python app.py
# 服务默认运行在 http://0.0.0.0:5007
```

---

## 📂 项目结构

```text
jibaohe/
├── pages/                    # 小程序业务页面
│   ├── index/               # 首页：资产列表与搜索
│   ├── add/                 # 功能：添加新资产
│   ├── edit/                # 功能：编辑资产信息
│   ├── statistics/          # 数据：统计图表展示
│   ├── select-icon/         # 功能：图标选择器
│   └── user/                # 我的：用户信息管理
├── utils/                    # 工具库
│   ├── config.example.js    # 配置模板（复制为 config.js 使用）
│   └── util.js              # 工具：时间格式化、正则验证
├── images/                   # 静态图片资源
├── app.js / app.json / app.wxss  # 小程序全局配置
├── project.config.json       # 开发者工具项目配置
└── backend/                  # Flask 后端服务
    ├── app.py               # 入口：Flask 应用启动
    ├── init_db.py           # 工具：一键初始化 SQLite 数据库
    ├── schema.sql           # 数据库表结构定义
    ├── requirements.txt     # Python 依赖列表
    ├── .env.example         # 环境变量配置模板
    ├── configs/             # 配置模块
    ├── api/                 # REST API 蓝图
    │   ├── login/          # 微信登录
    │   ├── users/          # 用户管理
    │   ├── items/          # 物品 CRUD
    │   ├── export/         # CSV 导出
    │   └── report/         # 统计报表
    └── static/              # 静态资源（图标等）
```

---

## 📩 联系作者

如果您在安装、使用过程中遇到问题，或有定制需求，请通过以下方式联系：

* **微信**：csdnxr
* **QQ**：294323976
* **邮箱**：leoucmao@gmail.com
* **Bug 反馈**：[GitHub Issues](https://github.com/ucmao/jibaohe/issues)

---

## ⚖️ 开源协议 & 免责声明

1. 本项目基于 **[MIT LICENSE](LICENSE)** 协议开源。
2. **免责声明**：本项目主要用于学习交流。请确保在生产环境中使用 HTTPS 安全域名，并妥善管理后端 API 访问权限。

**记宝盒** - 让资产管理更简单！ 📦💼✨

---
