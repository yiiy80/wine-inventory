## YOUR ROLE - INITIALIZER AGENT (Session 1 of Many)

You are the FIRST agent in a long-running autonomous development process.
Your job is to set up the foundation for all future coding agents.

### FIRST: Read the Project Specification

Start by reading `app_spec.txt` in your working directory. This file contains
the complete specification for what you need to build. Read it carefully
before proceeding.

### CRITICAL FIRST TASK: Create Features

Based on `app_spec.txt`, create features using the feature_create_bulk tool. The features are stored in a SQLite database,
which is the single source of truth for what needs to be built.

**Creating Features:**

Use the feature_create_bulk tool to add all features at once:

```
Use the feature_create_bulk tool with features=[
  {
    "category": "functional",
    "name": "Brief feature name",
    "description": "Brief description of the feature and what this test verifies",
    "steps": [
      "Step 1: Navigate to relevant page",
      "Step 2: Perform action",
      "Step 3: Verify expected result"
    ]
  },
  {
    "category": "style",
    "name": "Brief feature name",
    "description": "Brief description of UI/UX requirement",
    "steps": [
      "Step 1: Navigate to page",
      "Step 2: Take screenshot",
      "Step 3: Verify visual requirements"
    ]
  }
]
```

**Notes:**
- IDs and priorities are assigned automatically based on order
- All features start with `passes: false` by default
- You can create features in batches if there are many (e.g., 50 at a time)

**Requirements for features:**

- Create approximately **280 test cases** as specified in app_spec.txt
- Minimum **280 features** required to cover all functionality
- Both "functional" and "style" categories
- Mix of narrow tests (2-5 steps) and comprehensive tests (10+ steps)
- At least 35 tests MUST have 10+ steps each (for complex workflows)
- Order features by priority: fundamental features first (the API assigns priority based on order)
- All features start with `passes: false` automatically
- Cover every feature in the spec exhaustively
- **MUST include tests from ALL 20 mandatory categories below**

---

## MANDATORY TEST CATEGORIES

The feature_list.json **MUST** include tests from ALL of these categories. This is a Medium-Complex app tier.

### Category Distribution (Target: 280 features)

| Category                         | Minimum Count |
| -------------------------------- | ------------- |
| A. Security & Access Control     | 25            |
| B. Navigation Integrity          | 20            |
| C. Real Data Verification        | 35            |
| D. Workflow Completeness         | 25            |
| E. Error Handling                | 15            |
| F. UI-Backend Integration        | 25            |
| G. State & Persistence           | 12            |
| H. URL & Direct Access           | 12            |
| I. Double-Action & Idempotency   | 10            |
| J. Data Cleanup & Cascade        | 12            |
| K. Default & Reset               | 10            |
| L. Search & Filter Edge Cases    | 15            |
| M. Form Validation               | 18            |
| N. Feedback & Notification       | 12            |
| O. Responsive & Layout           | 12            |
| P. Accessibility                 | 10            |
| Q. Temporal & Timezone           | 10            |
| R. Concurrency & Race Conditions | 10            |
| S. Export/Import                 | 8             |
| T. Performance                   | 6             |
| **TOTAL**                        | **280+**      |

---

### A. Security & Access Control Tests

Test that unauthorized access is blocked and permissions are enforced.

**Required tests (examples):**

- 未认证用户无法访问受保护路由（重定向到登录页）
- 普通用户无法访问管理员专属页面（/admin/*）
- API端点对未认证请求返回401
- API端点对未授权角色返回403
- 会话在配置的不活动时间后过期
- 登出清除所有会话数据和令牌
- 无效/过期令牌被拒绝
- 每个角色只能看到其被允许的菜单项
- 直接URL访问未授权页面被阻止
- 敏感操作需要确认或重新认证
- 无法通过修改URL中的ID访问其他用户数据
- 密码重置流程安全工作
- 登录失败处理正确（无信息泄露）

### B. Navigation Integrity Tests

Test that every button, link, and menu item goes to the correct place.

**Required tests (examples):**

- 侧边栏每个按钮导航到正确页面
- 每个菜单项链接到存在的路由
- 所有CRUD操作按钮（编辑、删除、查看）跳转到正确的URL和正确的ID
- 每次导航后返回按钮正常工作
- 深层链接工作（带认证的任意页面直接URL访问）
- 面包屑反映实际导航路径
- 不存在的路由显示404页面（不崩溃）
- 登录后用户重定向到目标页面（或仪表盘）
- 登出后用户重定向到登录页
- 分页链接工作并保留当前筛选条件
- 页面内的标签导航正常工作
- 模态框关闭按钮返回之前状态
- 表单取消按钮返回上一页

### C. Real Data Verification Tests

Test that data is real (not mocked) and persists correctly.

**Required tests (examples):**

- 通过UI创建带唯一内容的红酒记录 → 验证它出现在列表中
- 创建记录 → 刷新页面 → 记录仍存在
- 创建记录 → 登出 → 登录 → 记录仍存在
- 编辑记录 → 验证更改在刷新后保持
- 删除记录 → 验证它从列表和数据库中消失
- 删除红酒 → 验证相关出入库记录也被删除
- 筛选/搜索 → 结果匹配测试中创建的实际数据
- 仪表盘统计反映真实记录数（创建3条记录，计数显示3）
- 库存数量在入库后正确增加
- 库存数量在出库后正确减少
- 导出功能导出你创建的实际数据
- 相关记录在父记录更改时更新
- 时间戳是真实且准确的（created_at, updated_at）
- 用户A创建的数据对用户B不可见（除非共享）
- 没有数据时正确显示空状态

### D. Workflow Completeness Tests

Test that every workflow can be completed end-to-end through the UI.

**Required tests (examples):**

- 红酒有完整的创建操作（通过UI表单）
- 红酒有完整的读取/查看操作（详情页加载）
- 红酒有完整的更新操作（编辑表单保存）
- 红酒有完整的删除操作（带确认对话框）
- 入库流程完整：选择红酒→输入数量→确认→库存更新
- 出库流程完整：选择红酒→输入数量→验证库存→确认→库存更新
- 用户管理：创建→编辑→禁用→删除完整流程
- 密码重置流程可端到端完成
- 数据导出流程可完成
- 数据导入流程可完成
- 批量选择操作工作正常
- 取消/撤销操作在适用时工作
- 必填字段为空时阻止提交
- 表单验证在提交前显示错误
- 成功提交显示成功反馈

### E. Error Handling Tests

Test graceful handling of errors and edge cases.

**Required tests (examples):**

- 网络失败显示用户友好的错误消息，不崩溃
- 无效表单输入显示字段级错误
- API错误向用户显示有意义的消息
- 404响应优雅处理（显示未找到页面）
- 500响应不暴露堆栈跟踪或技术细节
- 空搜索结果显示"未找到结果"消息
- 所有异步操作期间显示加载状态
- 超时不会无限期挂起UI
- 服务器错误后提交表单保留用户数据
- 文件上传错误（太大、类型错误）显示清晰消息
- 重复条目错误（如邮箱已存在）明确
- 出库数量超过库存时显示错误

### F. UI-Backend Integration Tests

Test that frontend and backend communicate correctly.

**Required tests (examples):**

- 前端请求格式匹配后端期望
- 后端响应格式匹配前端解析
- 所有下拉选项来自真实数据库数据（非硬编码）
- 产区、葡萄品种、供应商选择器从数据库填充
- 一个区域的更改在刷新后反映在相关区域
- 分页参数正确传递到后端
- 筛选参数正确传递到后端
- 排序参数正确传递到后端
- 表单提交数据正确到达后端
- 后端验证错误正确显示在前端

### G. State & Persistence Tests

Test application state management.

**Required tests (examples):**

- 刷新页面保持筛选状态
- 刷新页面保持当前分页
- 主题偏好在会话间保持
- 侧边栏折叠状态保持
- 表单草稿在意外导航时保持（如适用）
- 搜索词在页面刷新后保持
- 排序顺序在刷新后保持

### H. URL & Direct Access Tests

Test direct URL access to pages.

**Required tests (examples):**

- 直接URL访问红酒详情页（/wines/:id）工作
- 直接URL访问带筛选的列表页工作
- 直接URL访问不存在的红酒显示404
- URL中的查询参数正确应用筛选
- 分享URL保持完整状态
- 书签URL在之后访问时工作

### I. Double-Action & Idempotency Tests

Test protection against accidental double actions.

**Required tests (examples):**

- 双击提交按钮不创建重复记录
- 多次点击删除只删除一次
- 快速多次点击入库不重复入库
- 快速多次点击出库不重复出库
- 表单提交期间禁用提交按钮
- 防止并发编辑同一记录

### J. Data Cleanup & Cascade Tests

Test that related data is handled correctly on deletion.

**Required tests (examples):**

- 删除红酒删除其所有出入库记录
- 删除用户处理其创建的数据
- 删除操作有确认步骤
- 批量删除正确处理所有选中项
- 删除后相关下拉列表更新

### K. Default & Reset Tests

Test default values and reset functionality.

**Required tests (examples):**

- 新红酒表单有正确的默认值
- 低库存阈值有默认值（10）
- 筛选有重置按钮
- 重置筛选恢复默认列表
- 表单重置清除所有字段
- 主题重置到默认

### L. Search & Filter Edge Cases

Test search and filter functionality thoroughly.

**Required tests (examples):**

- 空搜索返回所有结果
- 特殊字符搜索不崩溃
- 大小写不敏感搜索
- 部分匹配搜索工作
- 多个筛选条件组合正确
- 筛选后分页正确
- 筛选无结果显示空状态
- 日期范围筛选边界正确
- 价格范围筛选边界正确
- 年份筛选工作正确
- 清除单个筛选不影响其他筛选

### M. Form Validation Tests

Test all form validation rules exhaustively.

**Required tests (examples):**

- 红酒名称必填 - 空时显示错误
- 红酒年份必须是4位数字
- 红酒产区必填
- 价格字段只接受数字
- 库存数量只接受整数
- 邮箱字段验证格式
- 密码字段验证复杂度
- 出库数量不能超过当前库存
- 错误消息具体明确
- 用户修复问题后错误清除
- 服务端验证匹配客户端

### N. Feedback & Notification Tests

Test that users get appropriate feedback for all actions.

**Required tests (examples):**

- 每次成功保存/创建显示成功反馈
- 每次失败操作显示错误反馈
- 每个异步操作期间显示加载动画
- 表单提交期间按钮禁用状态
- 长操作显示进度指示（文件上传）
- Toast/通知在适当时间后消失
- 多个通知不会错误重叠
- 成功消息具体明确（不只是"成功"）

### O. Responsive & Layout Tests

Test that the UI works on different screen sizes.

**Required tests (examples):**

- 桌面布局正确（1920px宽）
- 平板布局正确（768px宽）
- 手机布局正确（375px宽）
- 任何标准视口无水平滚动
- 移动端触摸目标足够大（44px最小）
- 模态框在移动端适配视口
- 长文本正确截断或换行（无溢出）
- 表格在移动端需要时水平滚动
- 导航在移动端适当折叠
- 侧边栏在移动端变为抽屉式

### P. Accessibility Tests

Test basic accessibility compliance.

**Required tests (examples):**

- Tab导航遍历所有交互元素
- 焦点环在所有聚焦元素上可见
- 屏幕阅读器可导航主要内容区域
- 仅图标按钮有ARIA标签
- 颜色对比度符合WCAG AA（文本4.5:1）
- 信息不仅通过颜色传达
- 表单字段有关联的标签
- 错误消息对屏幕阅读器宣告
- 图片有alt文本

### Q. Temporal & Timezone Tests

Test date/time handling.

**Required tests (examples):**

- 日期以用户本地时区显示
- 创建/更新时间戳准确且格式正确
- 日期选择器只允许有效日期范围
- 日期排序跨月/年正确工作
- 仪表盘时间范围选择工作正确
- 入库/出库时间记录正确

### R. Concurrency & Race Conditions Tests

Test multi-user and race condition scenarios.

**Required tests (examples):**

- 两个用户编辑同一红酒 - 最后保存获胜或显示冲突
- 用户查看时记录被删除 - 优雅处理
- 用户在第2页时列表更新 - 分页仍然工作
- 页面间快速导航 - 无陈旧数据显示
- API响应在用户导航后到达 - 不崩溃
- 同一用户并发表单提交被处理

### S. Export/Import Tests

Test data export and import functionality.

**Required tests (examples):**

- 导出所有数据 - 文件包含所有记录
- 导出筛选后数据 - 只包含筛选的记录
- 导入有效文件 - 所有记录正确创建
- 导入重复数据 - 正确处理（跳过/更新/错误）
- 导入格式错误文件 - 错误消息，无部分导入
- 导出然后导入 - 数据完整性完全保持
- CSV和Excel格式都支持

### T. Performance Tests

Test basic performance requirements.

**Required tests (examples):**

- 100条记录页面在3秒内加载
- 1000条记录页面在5秒内加载
- 搜索在1秒内响应
- 仪表盘图表加载流畅
- 正常操作期间无控制台错误
- 大文件导出显示进度

---

## ABSOLUTE PROHIBITION: NO MOCK DATA

The feature_list.json must include tests that **actively verify real data** and **detect mock data patterns**.

**Include these specific tests:**

1. 创建唯一测试数据（如 "TEST_12345_VERIFY_ME"）
2. 验证该精确数据出现在UI中
3. 刷新页面 - 数据保持
4. 删除数据 - 验证它消失
5. 如果出现测试中未创建的数据 - 标记为模拟数据

**The agent implementing features MUST NOT use:**

- 硬编码的假数据数组
- `mockData`, `fakeData`, `sampleData`, `dummyData` 变量
- `// TODO: replace with real API`
- 使用静态数据的 `setTimeout` 模拟API延迟
- 静态返回而非数据库查询

---

**CRITICAL INSTRUCTION:**
IT IS CATASTROPHIC TO REMOVE OR EDIT FEATURES IN FUTURE SESSIONS.
Features can ONLY be marked as passing (via the `feature_mark_passing` tool with the feature_id).
Never remove features, never edit descriptions, never modify testing steps.
This ensures no functionality is missed.

### SECOND TASK: Create init.sh

Create a script called `init.sh` that future agents can use to quickly
set up and run the development environment. The script should:

1. Install any required dependencies
2. Start any necessary servers or services
3. Print helpful information about how to access the running application

Base the script on the technology stack specified in `app_spec.txt`:
- Frontend: React + Vite + TypeScript + TailwindCSS (port 5173)
- Backend: FastAPI with Python (port 8000)
- Database: SQLite

### THIRD TASK: Initialize Git

Create a git repository and make your first commit with:

- init.sh (environment setup script)
- README.md (project overview and setup instructions)
- Any initial project structure files

Note: Features are stored in the SQLite database (features.db), not in a JSON file.

Commit message: "Initial setup: init.sh, project structure, and features created via API"

### FOURTH TASK: Create Project Structure

Set up the basic project structure based on what's specified in `app_spec.txt`.
This typically includes directories for frontend, backend, and any other
components mentioned in the spec.

Suggested structure:
```
project/
├── frontend/           # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── contexts/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.ts
├── backend/            # FastAPI
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── utils/
│   ├── requirements.txt
│   └── main.py
├── init.sh
├── README.md
└── app_spec.txt
```

### OPTIONAL: Start Implementation

If you have time remaining in this session, you may begin implementing
the highest-priority features. Get the next feature with:

```
Use the feature_get_next tool
```

Remember:
- Work on ONE feature at a time
- Test thoroughly before marking as passing
- Commit your progress before session ends

### ENDING THIS SESSION

Before your context fills up:

1. Commit all work with descriptive messages
2. Create `claude-progress.txt` with a summary of what you accomplished
3. Verify features were created using the feature_get_stats tool
4. Leave the environment in a clean, working state

The next agent will continue from here with a fresh context window.

---

**Remember:** You have unlimited time across many sessions. Focus on
quality over speed. Production-ready is the goal.
