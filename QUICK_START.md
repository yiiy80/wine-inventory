# 红酒库存管理系统 - 快速启动指南

## 方法一: 使用 init.sh 脚本 (推荐)

在项目根目录运行:

```bash
./init.sh
```

这个脚本会:
- 检查系统依赖 (Python, Node.js)
- 创建虚拟环境
- 安装所有依赖
- 启动后端和前端服务器

## 方法二: 手动启动

### 1. 启动后端服务器

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

后端将运行在: http://localhost:8000

### 2. 启动前端服务器 (新终端窗口)

```bash
cd frontend
npm install
npm run dev
```

前端将运行在: http://localhost:5173

## Windows 用户特别说明

如果你在 Git Bash 中遇到错误,请按以下步骤操作:

### 启动后端:

```bash
cd c:/github/autonomous-coding/generations/wine-inventory/backend
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 启动前端 (新的 Git Bash 窗口):

```bash
cd c:/github/autonomous-coding/generations/wine-inventory/frontend
npm install
npm run dev
```

## 访问应用

前端应用: http://localhost:5173

### 默认登录凭证:
- **邮箱**: admin@wine.com
- **密码**: admin123

## API 文档

FastAPI 自动生成的 API 文档:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 常见问题

### 问题: "Could not import module 'main'"

**原因**: 你在错误的目录运行了 uvicorn

**解决**: 确保你在 `backend` 目录中运行 `uvicorn main:app --reload`

### 问题: 端口已被占用

**解决**:
- 检查是否有其他进程使用端口 8000 或 5173
- 杀死旧进程或使用不同端口

### 问题: 前端连接后端失败

**解决**:
1. 确认后端正在运行 (http://localhost:8000)
2. 检查浏览器控制台的 CORS 错误
3. 确认 `frontend/src/services/api.ts` 中的 API_BASE_URL 是 `http://localhost:8000/api`

## 开发工具

### 热重载
- 后端: FastAPI 自动重载 (使用 `--reload` 标志)
- 前端: Vite HMR (热模块替换)

### 数据库
- SQLite 数据库文件: `backend/wine_inventory.db`
- 可以使用 DB Browser for SQLite 查看数据

### 查看日志
- 后端: 终端输出
- 前端: 浏览器开发者工具控制台

## 停止服务

按 `Ctrl+C` 在各自的终端窗口停止服务器。

## 下一步

应用已运行后:
1. 访问 http://localhost:5173
2. 使用 admin@wine.com / admin123 登录
3. 探索仪表盘和各个页面
4. 开始实现业务功能!

---

如需帮助,请查看:
- [前端实现文档](FRONTEND_IMPLEMENTATION.md)
- [后端 API 文档](http://localhost:8000/docs) (需先启动后端)
