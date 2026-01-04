# 登录问题修复

## 问题描述

用户在 http://localhost:5173/login 登录时失败，提示"请检查邮箱和密码"。

## 问题原因

前端代码发送的是 **form-urlencoded** 格式的数据：
```javascript
const formData = new URLSearchParams();
formData.append('username', credentials.email);
formData.append('password', credentials.password);
```

但后端期望的是 **JSON** 格式的数据：
```python
class UserLogin(BaseModel):
    email: str
    password: str
    remember_me: bool = False
```

## 解决方案

修改了 `frontend/src/contexts/AuthContext.tsx` 中的 `login` 函数：

### 修改前：
```typescript
const formData = new URLSearchParams();
formData.append('username', credentials.email);
formData.append('password', credentials.password);

const response = await api.post<LoginResponse>('/auth/login', formData, {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});
```

### 修改后：
```typescript
const response = await api.post<LoginResponse>('/auth/login', {
  email: credentials.email,
  password: credentials.password,
  remember_me: false,
});
```

## 验证

### 后端 API 测试成功：
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@wine.com","password":"admin123","remember_me":false}'
```

**返回结果：**
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer",
  "user": {
    "email": "admin@wine.com",
    "name": "系统管理员",
    "id": 1,
    "role": "admin",
    "is_active": true
  }
}
```

### 数据库验证：
- ✅ 管理员用户存在: admin@wine.com
- ✅ 角色: admin
- ✅ 状态: Active (已激活)

## 测试步骤

1. **确保后端正在运行**：
   ```bash
   cd backend
   uvicorn main:app --reload
   ```
   应该看到: `Uvicorn running on http://127.0.0.1:8000`

2. **确保前端正在运行**：
   前端应该已经在运行（http://localhost:5173）

3. **刷新浏览器页面**：
   由于 Vite 的热重载，代码更改会自动应用
   如果没有自动更新，请手动刷新页面（Ctrl+R 或 F5）

4. **尝试登录**：
   - 访问: http://localhost:5173/login
   - 邮箱: `admin@wine.com`
   - 密码: `admin123`
   - 点击"登录"按钮

5. **预期结果**：
   - 登录成功
   - 自动跳转到仪表盘 (http://localhost:5173/dashboard)
   - 可以看到侧边栏导航和用户信息

## 如果仍然无法登录

### 检查浏览器控制台：
1. 按 F12 打开开发者工具
2. 查看 Console 选项卡是否有错误
3. 查看 Network 选项卡中的 `/api/auth/login` 请求：
   - Status 应该是 200 OK
   - Response 应该包含 access_token 和 user 信息

### 常见问题：

**问题 1: 网络请求失败 (Network Error)**
- 原因: 后端服务器未运行
- 解决: 启动后端服务器 (参见上面的命令)

**问题 2: CORS 错误**
- 原因: 后端 CORS 配置问题
- 检查: backend/main.py 中的 CORS 设置应该允许 http://localhost:5173

**问题 3: 401 Unauthorized**
- 原因: 邮箱或密码错误
- 解决: 确认使用正确的凭证 (admin@wine.com / admin123)

**问题 4: 页面没有更新**
- 原因: 浏览器缓存
- 解决: 硬刷新页面 (Ctrl+Shift+R) 或清除缓存

## 额外信息

### API 端点：
- 登录: `POST /api/auth/login`
- 登出: `POST /api/auth/logout`
- 获取当前用户: `GET /api/auth/me`

### Token 存储：
- Token 存储在 localStorage 中 (key: 'token')
- 用户信息存储在 localStorage 中 (key: 'user')

### 自动认证：
- 页面刷新时会自动检查 localStorage 中的 token
- 如果 token 存在且有效，用户保持登录状态
- 如果 token 无效，会清除并重定向到登录页

---

**修复完成时间**: 2026-01-03

现在登录功能应该正常工作了！🎉
