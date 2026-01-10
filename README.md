# 🍷 红酒库存管理系统

一个专业的红酒库存管理Web应用，专为红酒厂商和红酒庄主设计。系统提供完整的红酒库存追踪、出入库管理、库存预警、数据可视化分析以及多用户权限管理功能，帮助用户高效管理红酒资产，优化库存决策。

[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.6-green.svg)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.18-38B2AC.svg)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3.36+-blue.svg)](https://sqlite.org/)

## ✨ 功能特性

### 🔐 用户认证与权限管理
- 用户登录/登出 (JWT认证)
- 多角色权限管理 (管理员/普通用户)
- 密码重置功能
- 会话管理

### 🍇 红酒库存管理
- 完整的红酒信息管理 (名称、年份、产区、葡萄品种、价格等)
- 智能库存追踪与预警
- 批量操作支持
- 高级搜索与筛选 (按产区、年份、库存状态等)
- 红酒图片上传

### 📊 出入库管理
- 实时出入库记录
- 自动库存更新
- 库存数量验证 (防止出库超限)
- 操作原因记录
- 历史记录查询与筛选

### ⚠️ 库存预警系统
- 智能低库存预警
- 可自定义预警阈值
- 实时预警状态显示
- 预警汇总统计

### 📈 数据可视化仪表盘
- 库存概览统计卡片
- 库存趋势折线图
- 产区分布饼图
- 时间范围选择 (7天/30天/90天/自定义)
- 实时数据刷新

### 📋 数据导入导出
- CSV/Excel格式导出
- 批量数据导入
- 数据验证与错误处理
- 导出进度提示

### 📝 操作日志系统
- 完整的用户操作记录
- 操作详情追踪 (变更前后对比)
- 日志筛选与搜索
- 审计追踪功能

### 👥 用户管理 (管理员专属)
- 用户账户管理
- 角色权限控制
- 用户状态管理 (启用/禁用)
- 用户操作日志查看

## 🛠️ 技术栈

### 前端
- **框架**: React 19.2.0 + Vite
- **语言**: TypeScript 5.9.3
- **样式**: TailwindCSS 4.1.18
- **状态管理**: React Hooks + Context API
- **路由**: React Router 7.11.0
- **图表**: Recharts 3.6.0
- **图标**: Lucide React 0.562.0
- **HTTP客户端**: Axios 1.13.2

### 后端
- **框架**: FastAPI 0.115.6
- **语言**: Python 3.10+
- **数据库**: SQLite 3.36+ + SQLAlchemy 2.0.36
- **认证**: JWT (python-jose)
- **密码哈希**: bcrypt (passlib)
- **数据验证**: Pydantic 2.10.4
- **服务器**: Uvicorn (ASGI)

### 开发工具
- **包管理**: npm 11.6.4
- **代码检查**: ESLint 9.39.1
- **类型检查**: TypeScript
- **版本控制**: Git

## 🚀 快速开始

### 方法一: 一键启动 (推荐)

```bash
# 克隆项目
git clone <repository-url>
cd wine-inventory

# 运行初始化脚本
./init.sh
```

脚本会自动：
- 检查系统依赖
- 创建Python虚拟环境
- 安装所有依赖
- 启动后端和前端服务器

### 方法二: 手动启动

#### 1. 启动后端服务器

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

后端运行在: http://localhost:8000

#### 2. 启动前端服务器 (新终端)

```bash
cd frontend
npm install
npm run dev
```

前端运行在: http://localhost:5173

## 📱 访问应用

- **前端应用**: http://localhost:5173
- **后端API**: http://localhost:8000
- **API文档**: http://localhost:8000/docs (Swagger UI)
- **API文档**: http://localhost:8000/redoc (ReDoc)

### 默认管理员账户

- **邮箱**: admin@wine.com
- **密码**: admin123

⚠️ **重要**: 首次使用后请立即修改密码！

## 🗂️ 项目结构

```
wine-inventory/
├── backend/                 # FastAPI 后端
│   ├── main.py             # 主应用文件
│   ├── database.py         # 数据库配置
│   ├── models.py           # SQLAlchemy 模型
│   ├── schemas.py          # Pydantic 数据模式
│   ├── routers/            # API 路由模块
│   │   ├── auth.py         # 认证相关
│   │   ├── wines.py        # 红酒管理
│   │   ├── inventory.py    # 出入库管理
│   │   ├── dashboard.py    # 仪表盘数据
│   │   ├── users.py        # 用户管理
│   │   ├── logs.py         # 操作日志
│   │   └── export_import.py # 数据导入导出
│   ├── requirements.txt    # Python 依赖
│   └── wine_inventory.db   # SQLite 数据库
├── frontend/               # React 前端
│   ├── src/
│   │   ├── components/     # 可复用组件
│   │   ├── pages/         # 页面组件
│   │   ├── contexts/      # React Context
│   │   ├── services/      # API 服务
│   │   ├── types/         # TypeScript 类型定义
│   │   ├── utils/         # 工具函数
│   │   └── App.tsx        # 主应用组件
│   ├── public/            # 静态资源
│   ├── package.json       # Node.js 依赖
│   └── tailwind.config.js # TailwindCSS 配置
├── prompts/               # 项目配置和提示
├── init.sh               # 初始化脚本
└── README.md             # 项目文档
```

## 🗄️ 数据库设计

### 用户表 (users)
```sql
- id: INTEGER PRIMARY KEY
- email: TEXT UNIQUE NOT NULL
- password_hash: TEXT NOT NULL
- name: TEXT NOT NULL
- role: TEXT NOT NULL ('admin' | 'user')
- is_active: BOOLEAN DEFAULT TRUE
- created_at: DATETIME
- updated_at: DATETIME
```

### 红酒表 (wines)
```sql
- id: INTEGER PRIMARY KEY
- name: TEXT NOT NULL
- vintage_year: INTEGER NOT NULL
- region: TEXT NOT NULL
- grape_variety: TEXT
- price: REAL
- supplier: TEXT
- storage_location: TEXT
- current_stock: INTEGER DEFAULT 0
- low_stock_threshold: INTEGER DEFAULT 10
- notes: TEXT
- image_url: TEXT
- created_by: INTEGER (FK -> users.id)
- created_at: DATETIME
- updated_at: DATETIME
```

### 出入库记录表 (inventory_transactions)
```sql
- id: INTEGER PRIMARY KEY
- wine_id: INTEGER (FK -> wines.id)
- transaction_type: TEXT ('in' | 'out')
- quantity: INTEGER NOT NULL
- reason: TEXT
- performed_by: INTEGER (FK -> users.id)
- created_at: DATETIME
```

### 操作日志表 (operation_logs)
```sql
- id: INTEGER PRIMARY KEY
- user_id: INTEGER (FK -> users.id)
- action_type: TEXT NOT NULL
- entity_type: TEXT
- entity_id: INTEGER
- details: TEXT (JSON格式)
- ip_address: TEXT
- created_at: DATETIME
```

## 🔗 API 接口

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `POST /api/auth/refresh` - 刷新令牌
- `GET /api/auth/me` - 获取当前用户信息

### 红酒管理
- `GET /api/wines` - 获取红酒列表 (支持分页、搜索、筛选)
- `POST /api/wines` - 创建新红酒
- `GET /api/wines/{id}` - 获取红酒详情
- `PUT /api/wines/{id}` - 更新红酒信息
- `DELETE /api/wines/{id}` - 删除红酒
- `GET /api/wines/low-stock` - 获取低库存红酒

### 出入库管理
- `GET /api/inventory` - 获取出入库记录
- `POST /api/inventory/in` - 入库操作
- `POST /api/inventory/out` - 出库操作

### 仪表盘数据
- `GET /api/dashboard/summary` - 获取统计摘要
- `GET /api/dashboard/trends` - 获取库存趋势数据
- `GET /api/dashboard/distribution` - 获取库存分布数据

### 用户管理 (管理员)
- `GET /api/users` - 获取用户列表
- `POST /api/users` - 创建新用户
- `PUT /api/users/{id}` - 更新用户信息
- `DELETE /api/users/{id}` - 删除用户

### 数据导入导出
- `GET /api/export/wines` - 导出红酒数据
- `GET /api/export/transactions` - 导出出入库记录
- `POST /api/import/wines` - 导入红酒数据

## 🎨 设计系统

### 色彩方案
- **主色**: 勃艮第红 (#722F37) - 代表红酒的优雅
- **辅助色**: 香槟金 (#C9A227) - 突出重要信息
- **强调色**: 酒瓶绿 (#1E4D2B) - 用于成功状态
- **背景**: 米白色 (#FAF7F2) / 深酒色 (#1A1412)

### 字体系统
- **标题字体**: Playfair Display - 优雅的serif字体
- **正文字体**: Source Sans 3 - 现代sans-serif字体
- **等宽字体**: JetBrains Mono - 代码和数据展示

### 响应式设计
- 桌面端 (≥1024px): 全功能侧边栏布局
- 平板端 (≥768px): 适应性布局
- 手机端 (<768px): 抽屉式侧边栏

## 🔒 安全特性

- **JWT认证**: 安全的令牌-based认证系统
- **密码加密**: bcrypt哈希算法
- **CORS配置**: 安全的跨域资源共享
- **输入验证**: 全面的服务器端数据验证
- **SQL注入防护**: 使用ORM参数化查询
- **敏感操作确认**: 删除等操作需要二次确认

## 📊 性能优化

- **热重载**: 开发环境支持热模块替换
- **代码分割**: 按路由进行代码分割
- **懒加载**: 组件和路由的延迟加载
- **缓存策略**: 合理使用浏览器缓存
- **数据库优化**: 适当的索引和查询优化

## 🧪 测试与质量

- **类型安全**: 完整的TypeScript类型覆盖
- **代码检查**: ESLint代码质量检查
- **错误处理**: 全面的用户友好的错误处理
- **日志记录**: 完整的操作日志追踪

### 📊 当前项目状态

✅ **后端测试**: 24/24 通过 (100%)
- JWT认证系统正常
- 所有API端点功能完整
- 数据库操作稳定

✅ **前端测试**: 20/20 通过 (100%)
- 组件渲染正常
- API集成无误
- TypeScript编译通过

✅ **系统集成**: 完全正常
- 前后端通信顺畅
- CORS配置正确
- 生产构建成功

### 🔧 近期修复

- **JWT认证Bug**: 修复python-jose库的sub字段类型问题
- **环境变量**: 添加SECRET_KEY等敏感配置的环境变量支持
- **TypeScript错误**: 修复17个编译错误，包括unused imports和变量
- **调试日志**: 清理生产环境不需要的调试输出
- **构建优化**: 前端构建成功，包大小优化建议

## 🚀 部署说明

### 生产环境部署

1. **构建前端**:
```bash
cd frontend
npm run build
```

2. **部署后端**:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

3. **配置Web服务器** (如Nginx) 代理API请求到后端

### Docker部署 (可选)

```dockerfile
# Dockerfile 示例
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🤝 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 支持与反馈

如果您在使用过程中遇到问题或有建议，请：

1. 查看 [故障排除指南](README_INIT.md)
2. 查看 [前端实现文档](FRONTEND_IMPLEMENTATION.md)
3. 提交 Issue 或 Pull Request

## 🙏 致谢

- [React](https://reactjs.org/) - 用户界面库
- [FastAPI](https://fastapi.tiangolo.com/) - 现代Python Web框架
- [TailwindCSS](https://tailwindcss.com/) - 实用优先的CSS框架
- [Recharts](https://recharts.org/) - React图表库
- [Lucide](https://lucide.dev/) - 精美的图标库

---

**红酒库存管理系统** - 让红酒管理变得简单、专业、高效！🍷✨

## LINK

[長時間稼働エージェントのための効果的なハーネス設計](https://log.eurekapu.com/effective-harnesses-for-long-running-agents)
[Claude Code 設定プロンプト完全ガイド](https://log.eurekapu.com/claude-code-settings-guide)