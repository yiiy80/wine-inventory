# 红酒库存管理系统 - 初始化指南

## 快速开始

要启动红酒库存管理系统，只需运行：

```bash
./init.sh
```

这个脚本会：
1. 检查系统依赖（Python 3.8+, Node.js 18+, npm）
2. 设置后端 Python 虚拟环境并安装依赖
3. 安装前端 Node.js 依赖
4. 同时启动后端服务器（端口 8000）和前端服务器（端口 5173）

## 服务地址

- **前端应用**: http://localhost:5173
- **后端 API**: http://localhost:8000
- **API 文档**: http://localhost:8000/docs

## 停止服务

在运行脚本的终端中按 `Ctrl+C` 停止所有服务。

## 手动启动

如果你想分别启动服务：

### 后端
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 前端
```bash
cd frontend
npm install
npm run dev
```

## 功能特性

系统包含 336 个功能特性，分为以下类别：
- 用户认证和权限管理
- 红酒库存管理
- 出入库操作
- 库存预警系统
- 数据可视化仪表盘
- 数据导入导出
- 操作日志记录

## 数据库

系统使用 SQLite 数据库，文件位于 `features.db`。数据库会在首次启动时自动创建和初始化。

## 默认管理员账户

系统会自动创建一个默认管理员账户：
- 用户名：admin@example.com
- 密码：admin123

**首次使用后请立即修改密码！**

## 故障排除

1. **端口冲突**: 如果 8000 或 5173 端口被占用，脚本会报错。请停止占用端口的服务或修改端口配置。

2. **依赖安装失败**: 确保你有稳定的网络连接。如果 pip/npm 安装失败，尝试手动安装依赖。

3. **权限问题**: 在 Linux/Mac 上，确保脚本有执行权限：`chmod +x init.sh`

4. **Python 版本问题**: 需要 Python 3.8 或更高版本。

## 项目结构

```
wine-inventory/
├── backend/          # FastAPI 后端
│   ├── main.py      # 主应用文件
│   ├── database.py  # 数据库配置
│   ├── models.py    # SQLAlchemy 模型
│   ├── schemas.py   # Pydantic 模式
│   ├── routers/     # API 路由
│   └── requirements.txt
├── frontend/         # React 前端
│   ├── src/
│   ├── public/
│   └── package.json
├── prompts/          # 项目配置
├── init.sh          # 初始化脚本
└── features.db      # SQLite 数据库
