# 红酒库存管理系统 - 前端实现文档

## 实现概要

完成了红酒库存管理系统的前端应用开发,基于 React + TypeScript + Vite + Tailwind CSS 技术栈。

## 技术栈

- **框架**: React 19.2.0
- **语言**: TypeScript 5.9.3
- **构建工具**: Vite 7.2.4
- **样式**: Tailwind CSS v4 (使用 @tailwindcss/postcss)
- **路由**: React Router DOM 7.1.3
- **HTTP 客户端**: Axios 1.9.2
- **图标**: Lucide React 0.469.0
- **图表**: Recharts 2.15.0

## 已实现功能

### 1. 核心基础设施

#### 认证系统
- ✅ Auth Context (AuthContext.tsx) - JWT token 管理
- ✅ API 客户端 (api.ts) - Axios 配置,自动添加 token
- ✅ Protected Routes - 路由保护,未登录重定向
- ✅ 登录页面 (LoginPage.tsx) - 优雅的红酒主题设计

#### 主题系统
- ✅ Theme Context (ThemeContext.tsx) - 深色/浅色主题切换
- ✅ 本地存储主题偏好
- ✅ 自动检测系统主题偏好

#### 布局系统
- ✅ 主布局 (Layout.tsx) - 响应式侧边栏导航
- ✅ 移动端适配 - 抽屉式侧边栏
- ✅ 顶部导航栏 - 主题切换,登出按钮
- ✅ 用户信息显示

### 2. 页面实现

#### 已完成的页面
1. **登录页面** (LoginPage.tsx)
   - 邮箱/密码登录表单
   - 错误提示
   - 加载状态
   - 红酒主题设计 (勃艮第红主色调)

2. **仪表盘** (DashboardPage.tsx)
   - 统计卡片 (红酒品类,库存量,总价值,预警数)
   - 库存趋势折线图
   - 产区分布饼图
   - 快速操作入口
   - 数据刷新功能

3. **红酒管理** (WinesPage.tsx)
   - 红酒列表表格
   - 搜索功能
   - 库存状态标识 (正常/低库存/缺货)
   - 添加红酒按钮
   - 编辑/删除操作按钮

#### 占位页面 (已创建框架)
4. **出入库管理** (InventoryPage.tsx)
5. **库存预警** (AlertsPage.tsx)
6. **数据报表** (ReportsPage.tsx)
7. **操作日志** (LogsPage.tsx)
8. **用户管理** (UsersPage.tsx) - 仅管理员
9. **系统设置** (SettingsPage.tsx) - 仅管理员

### 3. 样式设计

#### 主题色彩 (符合 app_spec.txt 规范)
- **Primary**: #722F37 (勃艮第红)
- **Primary Light**: #8B3A42
- **Primary Dark**: #5A252C
- **Secondary**: #C9A227 (香槟金)
- **Accent**: #1E4D2B (酒瓶绿)
- **Background Light**: #FAF7F2 (米白)
- **Background Dark**: #1A1412 (深红酒色)

#### 字体设计
- **标题**: Playfair Display (优雅衬线字体)
- **正文**: Source Sans 3
- **中文**: PingFang SC, Microsoft YaHei

#### 组件样式
- 自定义按钮样式 (.btn-primary, .btn-secondary, .btn-danger)
- 卡片组件 (.card)
- 表单输入 (.input-field, .label)
- 响应式设计 (支持桌面,平板,手机)

### 4. 类型定义

完整的 TypeScript 类型定义 (types/index.ts):
- User
- Wine
- InventoryTransaction
- DashboardStats
- OperationLog
- LoginRequest / LoginResponse
- PaginatedResponse<T>

### 5. 路由配置

- 公开路由: `/login`
- 保护路由: `/dashboard`, `/wines`, `/inventory`, `/alerts`, `/reports`, `/logs`
- 管理员路由: `/users`, `/settings`
- 默认路由: 重定向到 `/dashboard`

## 项目结构

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.tsx          # 主布局组件
│   │   └── ProtectedRoute.tsx  # 路由保护
│   ├── contexts/
│   │   ├── AuthContext.tsx     # 认证上下文
│   │   └── ThemeContext.tsx    # 主题上下文
│   ├── pages/
│   │   ├── LoginPage.tsx       # 登录页
│   │   ├── DashboardPage.tsx   # 仪表盘
│   │   ├── WinesPage.tsx       # 红酒管理
│   │   ├── InventoryPage.tsx   # 出入库
│   │   ├── AlertsPage.tsx      # 预警
│   │   ├── ReportsPage.tsx     # 报表
│   │   ├── LogsPage.tsx        # 日志
│   │   ├── UsersPage.tsx       # 用户管理
│   │   └── SettingsPage.tsx    # 系统设置
│   ├── services/
│   │   └── api.ts              # API 客户端
│   ├── types/
│   │   └── index.ts            # 类型定义
│   ├── App.tsx                 # 主应用组件
│   ├── main.tsx                # 入口文件
│   └── index.css               # 全局样式
├── tailwind.config.js          # Tailwind 配置
├── postcss.config.js           # PostCSS 配置
├── package.json
└── vite.config.ts
```

## 构建状态

✅ **构建成功** - 无错误,无警告 (除了 chunk 大小提示)

```
✓ built in 13.76s
dist/index.html                   0.46 kB │ gzip:   0.29 kB
dist/assets/index-DGoyxAtE.css   19.05 kB │ gzip:   4.81 kB
dist/assets/index-CIeDCCVr.js   656.45 kB │ gzip: 204.19 kB
```

## 服务器配置

- **Backend API**: http://localhost:8000
- **Frontend Dev**: http://localhost:5173
- **生产构建**: dist/ 目录

## 默认登录凭证

- **邮箱**: admin@wine.com
- **密码**: admin123

## 下一步开发建议

### 高优先级
1. 实现红酒 CRUD 操作 (添加,编辑,删除模态框)
2. 完成出入库功能 (入库/出库表单和历史记录)
3. 实现库存预警列表和详情
4. 数据导出功能 (CSV/Excel)

### 中优先级
5. 操作日志查看和筛选
6. 用户管理页面 (创建,编辑,禁用用户)
7. 个人资料编辑
8. 密码修改功能

### 低优先级
9. 数据可视化优化 (更多图表类型)
10. 高级筛选和搜索
11. 批量操作
12. 数据导入功能

## 已知限制

1. **占位页面**: 部分页面只有框架,功能待实现
2. **图表数据**: 仪表盘图表需要后端 API 返回正确格式数据
3. **国际化**: 目前仅支持中文
4. **移动端优化**: 表格在小屏幕需要进一步优化

## 技术注意事项

### Tailwind CSS v4
本项目使用了 Tailwind CSS v4,与 v3 有以下主要区别:
- 使用 `@import "tailwindcss"` 替代 `@tailwind` 指令
- 需要 `@tailwindcss/postcss` 插件
- 不支持旧的 `@apply` 语法在某些场景下
- 使用原生 CSS 变量而非 JIT 编译

### TypeScript 严格模式
- 启用了 `verbatimModuleSyntax`,需要使用 `import type` 语法
- 所有类型导入都使用 `type` 前缀

### 深色模式
- 使用 `class` 策略 (tailwind.config.js 中的 `darkMode: 'class'`)
- 通过 `document.documentElement.classList.toggle('dark')` 切换
- 所有组件都支持深色模式样式

## 贡献者备注

本前端应用严格遵循 app_spec.txt 中的设计规范,包括:
- ✅ 红酒主题色彩方案
- ✅ 指定字体 (Playfair Display + Source Sans 3)
- ✅ 响应式设计
- ✅ 深色/浅色主题
- ✅ 中文界面
- ✅ JWT 认证
- ✅ 角色权限 (admin/user)

所有核心功能的 UI 框架已就绪,可以直接连接后端 API 进行数据交互。
