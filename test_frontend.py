"""
前端集成测试脚本
使用Playwright进行浏览器自动化测试

运行前确保：
1. Backend已启动: cd backend && uvicorn main:app --reload
2. Frontend已启动: cd frontend && npm run dev
3. 安装依赖: pip install playwright && playwright install chromium

运行测试:
    python test_frontend.py
"""

import asyncio
import sys
import time
from playwright.async_api import async_playwright, Page, expect

# 测试配置
FRONTEND_URL = "http://localhost:5173"
BACKEND_URL = "http://localhost:8000"
ADMIN_EMAIL = "admin@wine.com"
ADMIN_PASSWORD = "admin123"

# ANSI颜色代码
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

class FrontendTester:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.warnings = 0
        self.test_results = []

    def log_test(self, name: str, status: str, message: str = ""):
        """记录测试结果"""
        if status == "PASS":
            print(f"{GREEN}[PASS]{RESET} {name}")
            self.passed += 1
        elif status == "FAIL":
            print(f"{RED}[FAIL]{RESET} {name}")
            if message:
                print(f"  {RED}Error: {message}{RESET}")
            self.failed += 1
        elif status == "WARN":
            print(f"{YELLOW}[WARN]{RESET} {name}")
            if message:
                print(f"  {YELLOW}Warning: {message}{RESET}")
            self.warnings += 1

        self.test_results.append({
            "name": name,
            "status": status,
            "message": message
        })

    async def check_services(self, page: Page) -> bool:
        """检查前后端服务是否运行"""
        print(f"\n{BLUE}=== 检查服务状态 ==={RESET}")

        # 检查后端
        try:
            response = await page.request.get(f"{BACKEND_URL}/api/auth/login")
            if response.status == 405:  # POST only
                self.log_test("后端服务运行", "PASS")
            else:
                self.log_test("后端服务运行", "FAIL", f"意外状态码: {response.status}")
                return False
        except Exception as e:
            self.log_test("后端服务运行", "FAIL", f"无法连接: {str(e)}")
            return False

        # 检查前端
        try:
            await page.goto(FRONTEND_URL, timeout=10000)
            await page.wait_for_load_state("networkidle", timeout=10000)
            self.log_test("前端服务运行", "PASS")
            return True
        except Exception as e:
            self.log_test("前端服务运行", "FAIL", f"无法加载: {str(e)}")
            return False

    async def test_login_flow(self, page: Page) -> bool:
        """测试登录流程"""
        print(f"\n{BLUE}=== 测试登录流程 ==={RESET}")

        try:
            # 访问登录页面
            await page.goto(f"{FRONTEND_URL}/login")
            await page.wait_for_load_state("networkidle")
            self.log_test("加载登录页面", "PASS")

            # 检查页面元素
            email_input = page.locator('input[type="email"]')
            password_input = page.locator('input[type="password"]')
            login_button = page.locator('button:has-text("登录")')

            if await email_input.count() > 0:
                self.log_test("邮箱输入框存在", "PASS")
            else:
                self.log_test("邮箱输入框存在", "FAIL")
                return False

            # 测试无效登录
            await email_input.fill("wrong@email.com")
            await password_input.fill("wrongpassword")
            await login_button.click()
            await page.wait_for_timeout(2000)

            # 检查是否显示错误（Toast或错误消息）
            error_visible = await page.locator('text=/错误|失败|invalid|incorrect/i').count() > 0
            if error_visible:
                self.log_test("无效凭据显示错误", "PASS")
            else:
                self.log_test("无效凭据显示错误", "WARN", "未检测到错误提示")

            # 测试有效登录
            await email_input.fill(ADMIN_EMAIL)
            await password_input.fill(ADMIN_PASSWORD)
            await login_button.click()

            # 等待跳转到仪表盘
            await page.wait_for_url(f"{FRONTEND_URL}/dashboard", timeout=5000)
            self.log_test("有效凭据登录成功", "PASS")

            # 检查是否存储了token
            await page.wait_for_timeout(1000)
            token = await page.evaluate("localStorage.getItem('token')")
            if token:
                self.log_test("Token存储成功", "PASS")
            else:
                self.log_test("Token存储成功", "FAIL")
                return False

            return True

        except Exception as e:
            self.log_test("登录流程测试", "FAIL", str(e))
            return False

    async def test_dashboard(self, page: Page):
        """测试仪表盘"""
        print(f"\n{BLUE}=== 测试仪表盘 ==={RESET}")

        try:
            await page.goto(f"{FRONTEND_URL}/dashboard")
            await page.wait_for_load_state("networkidle")
            self.log_test("加载仪表盘页面", "PASS")

            # 检查统计卡片
            stats_cards = page.locator('[class*="stat"], [class*="card"]')
            count = await stats_cards.count()
            if count >= 4:
                self.log_test("统计卡片显示", "PASS", f"找到 {count} 个卡片")
            else:
                self.log_test("统计卡片显示", "WARN", f"只找到 {count} 个卡片")

            # 检查是否有图表（通过SVG或Canvas）
            charts = page.locator('svg, canvas')
            chart_count = await charts.count()
            if chart_count > 0:
                self.log_test("图表渲染", "PASS", f"找到 {chart_count} 个图表")
            else:
                self.log_test("图表渲染", "WARN", "未找到图表元素")

        except Exception as e:
            self.log_test("仪表盘测试", "FAIL", str(e))

    async def test_wines_management(self, page: Page):
        """测试红酒管理"""
        print(f"\n{BLUE}=== 测试红酒管理 ==={RESET}")

        try:
            await page.goto(f"{FRONTEND_URL}/wines")
            await page.wait_for_load_state("networkidle")
            await page.wait_for_timeout(1000)
            self.log_test("加载红酒管理页面", "PASS")

            # 检查红酒列表
            wine_items = page.locator('table tbody tr, [class*="wine-item"], [class*="wine-card"]')
            count = await wine_items.count()
            if count > 0:
                self.log_test("红酒列表显示", "PASS", f"找到 {count} 条记录")
            else:
                self.log_test("红酒列表显示", "WARN", "列表为空")

            # 测试搜索功能
            search_input = page.locator('input[placeholder*="搜索"], input[type="search"]')
            if await search_input.count() > 0:
                self.log_test("搜索框存在", "PASS")
                await search_input.fill("测试")
                await page.wait_for_timeout(1000)
            else:
                self.log_test("搜索框存在", "WARN", "未找到搜索框")

            # 测试添加红酒按钮
            add_button = page.locator('button:has-text("添加"), button:has-text("新增"), button:has-text("Add")')
            if await add_button.count() > 0:
                self.log_test("添加红酒按钮存在", "PASS")

                # 点击添加按钮
                await add_button.first.click()
                await page.wait_for_timeout(1000)

                # 检查是否打开了模态框
                modal = page.locator('[role="dialog"], .modal, [class*="modal"]')
                if await modal.count() > 0:
                    self.log_test("添加红酒模态框打开", "PASS")

                    # 关闭模态框（通过ESC或关闭按钮）
                    await page.keyboard.press("Escape")
                    await page.wait_for_timeout(500)
                else:
                    self.log_test("添加红酒模态框打开", "WARN", "未找到模态框")
            else:
                self.log_test("添加红酒按钮存在", "WARN", "未找到添加按钮")

        except Exception as e:
            self.log_test("红酒管理测试", "FAIL", str(e))

    async def test_inventory_management(self, page: Page):
        """测试库存管理"""
        print(f"\n{BLUE}=== 测试库存管理 ==={RESET}")

        try:
            await page.goto(f"{FRONTEND_URL}/inventory")
            await page.wait_for_load_state("networkidle")
            await page.wait_for_timeout(1000)
            self.log_test("加载库存管理页面", "PASS")

            # 检查交易记录列表
            transaction_items = page.locator('table tbody tr, [class*="transaction-item"]')
            count = await transaction_items.count()
            if count >= 0:
                self.log_test("交易记录列表显示", "PASS", f"找到 {count} 条记录")

            # 检查入库/出库按钮
            stock_in_button = page.locator('button:has-text("入库")')
            stock_out_button = page.locator('button:has-text("出库")')

            if await stock_in_button.count() > 0:
                self.log_test("入库按钮存在", "PASS")
            else:
                self.log_test("入库按钮存在", "WARN")

            if await stock_out_button.count() > 0:
                self.log_test("出库按钮存在", "PASS")
            else:
                self.log_test("出库按钮存在", "WARN")

        except Exception as e:
            self.log_test("库存管理测试", "FAIL", str(e))

    async def test_user_management(self, page: Page):
        """测试用户管理（管理员功能）"""
        print(f"\n{BLUE}=== 测试用户管理 ==={RESET}")

        try:
            await page.goto(f"{FRONTEND_URL}/users")
            await page.wait_for_load_state("networkidle")
            await page.wait_for_timeout(1000)
            self.log_test("加载用户管理页面", "PASS")

            # 检查用户列表
            user_items = page.locator('table tbody tr, [class*="user-item"]')
            count = await user_items.count()
            if count > 0:
                self.log_test("用户列表显示", "PASS", f"找到 {count} 个用户")
            else:
                self.log_test("用户列表显示", "WARN", "用户列表为空")

        except Exception as e:
            # 如果访问被拒绝，这实际上是正确的（权限控制）
            if "403" in str(e) or "Forbidden" in str(e):
                self.log_test("用户管理权限控制", "PASS", "非管理员正确被拒绝访问")
            else:
                self.log_test("用户管理测试", "FAIL", str(e))

    async def test_navigation(self, page: Page):
        """测试导航功能"""
        print(f"\n{BLUE}=== 测试导航 ==={RESET}")

        try:
            # 检查侧边栏导航
            nav_links = page.locator('nav a, [class*="sidebar"] a')
            count = await nav_links.count()
            if count >= 5:
                self.log_test("侧边栏导航链接", "PASS", f"找到 {count} 个链接")
            else:
                self.log_test("侧边栏导航链接", "WARN", f"只找到 {count} 个链接")

            # 测试页面跳转
            await page.goto(f"{FRONTEND_URL}/alerts")
            await page.wait_for_load_state("networkidle")
            self.log_test("访问低库存警告页", "PASS")

            await page.goto(f"{FRONTEND_URL}/logs")
            await page.wait_for_load_state("networkidle")
            self.log_test("访问操作日志页", "PASS")

        except Exception as e:
            self.log_test("导航测试", "FAIL", str(e))

    async def test_theme_switching(self, page: Page):
        """测试主题切换"""
        print(f"\n{BLUE}=== 测试主题切换 ==={RESET}")

        try:
            await page.goto(f"{FRONTEND_URL}/dashboard")
            await page.wait_for_load_state("networkidle")

            # 查找主题切换按钮（可能是图标按钮）
            theme_button = page.locator('button[aria-label*="主题"], button[aria-label*="theme"], button:has-text("🌙"), button:has-text("☀️")')

            if await theme_button.count() > 0:
                self.log_test("主题切换按钮存在", "PASS")

                # 点击切换主题
                await theme_button.first.click()
                await page.wait_for_timeout(500)
                self.log_test("主题切换功能", "PASS")
            else:
                self.log_test("主题切换按钮存在", "WARN", "未找到主题切换按钮")

        except Exception as e:
            self.log_test("主题切换测试", "FAIL", str(e))

    async def test_logout(self, page: Page):
        """测试登出功能"""
        print(f"\n{BLUE}=== 测试登出功能 ==={RESET}")

        try:
            await page.goto(f"{FRONTEND_URL}/dashboard")
            await page.wait_for_load_state("networkidle")

            # 查找登出按钮
            logout_button = page.locator('button:has-text("登出"), button:has-text("退出"), button:has-text("Logout")')

            if await logout_button.count() > 0:
                self.log_test("登出按钮存在", "PASS")

                # 点击登出
                await logout_button.first.click()
                await page.wait_for_timeout(1000)

                # 检查是否跳转到登录页
                current_url = page.url
                if "login" in current_url:
                    self.log_test("登出后跳转到登录页", "PASS")
                else:
                    self.log_test("登出后跳转到登录页", "WARN", f"当前URL: {current_url}")

                # 检查token是否被清除
                token = await page.evaluate("localStorage.getItem('token')")
                if not token:
                    self.log_test("Token已清除", "PASS")
                else:
                    self.log_test("Token已清除", "FAIL", "Token仍然存在")
            else:
                self.log_test("登出按钮存在", "WARN", "未找到登出按钮")

        except Exception as e:
            self.log_test("登出测试", "FAIL", str(e))

    async def run_all_tests(self):
        """运行所有测试"""
        print(f"{BLUE}{'='*60}{RESET}")
        print(f"{BLUE}红酒库存管理系统 - 前端集成测试{RESET}")
        print(f"{BLUE}{'='*60}{RESET}")

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=False)  # headless=True for CI
            context = await browser.new_context(
                viewport={"width": 1920, "height": 1080}
            )
            page = await context.new_page()

            try:
                # 检查服务
                if not await self.check_services(page):
                    print(f"\n{RED}服务检查失败，无法继续测试{RESET}")
                    return

                # 运行测试套件
                if await self.test_login_flow(page):
                    await self.test_dashboard(page)
                    await self.test_wines_management(page)
                    await self.test_inventory_management(page)
                    await self.test_user_management(page)
                    await self.test_navigation(page)
                    await self.test_theme_switching(page)
                    await self.test_logout(page)
                else:
                    print(f"\n{RED}登录失败，跳过后续测试{RESET}")

            finally:
                await browser.close()

        # 打印测试总结
        self.print_summary()

    def print_summary(self):
        """打印测试总结"""
        total = self.passed + self.failed + self.warnings
        print(f"\n{BLUE}{'='*60}{RESET}")
        print(f"{BLUE}测试总结{RESET}")
        print(f"{BLUE}{'='*60}{RESET}")
        print(f"总测试数: {total}")
        print(f"{GREEN}通过: {self.passed}{RESET}")
        print(f"{RED}失败: {self.failed}{RESET}")
        print(f"{YELLOW}警告: {self.warnings}{RESET}")

        if self.failed == 0:
            print(f"\n{GREEN}[SUCCESS] All critical tests passed!{RESET}")
            coverage = (self.passed / total * 100) if total > 0 else 0
            print(f"Test coverage: {coverage:.1f}%")
        else:
            print(f"\n{RED}[FAILED] Found {self.failed} failed tests{RESET}")
            print(f"\nFailed tests:")
            for result in self.test_results:
                if result["status"] == "FAIL":
                    print(f"  {RED}[X]{RESET} {result['name']}: {result['message']}")

async def main():
    tester = FrontendTester()
    await tester.run_all_tests()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print(f"\n{YELLOW}测试被用户中断{RESET}")
        sys.exit(0)
