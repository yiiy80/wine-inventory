"""
基础前端测试脚本
测试前端页面加载和基本可用性（不需要浏览器自动化）

运行前确保：
1. Backend已启动: http://localhost:8000
2. Frontend已启动: http://localhost:5173

运行测试:
    python test_frontend_basic.py
"""

import requests
import sys
import time

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

class BasicFrontendTester:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.warnings = 0
        self.token = None

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

    def test_frontend_service(self):
        """测试前端服务是否运行"""
        print(f"\n{BLUE}=== 检查前端服务 ==={RESET}")
        try:
            response = requests.get(FRONTEND_URL, timeout=5)
            if response.status_code == 200:
                self.log_test("前端服务运行", "PASS", f"状态码: {response.status_code}")

                # 检查是否是HTML页面
                content_type = response.headers.get('content-type', '')
                if 'html' in content_type.lower():
                    self.log_test("返回HTML页面", "PASS")
                else:
                    self.log_test("返回HTML页面", "WARN", f"Content-Type: {content_type}")

                return True
            else:
                self.log_test("前端服务运行", "FAIL", f"状态码: {response.status_code}")
                return False
        except requests.exceptions.ConnectionError:
            self.log_test("前端服务运行", "FAIL", "无法连接到前端服务")
            return False
        except Exception as e:
            self.log_test("前端服务运行", "FAIL", str(e))
            return False

    def test_backend_integration(self):
        """测试后端API集成"""
        print(f"\n{BLUE}=== 测试后端API集成 ==={RESET}")

        try:
            # 测试登录
            response = requests.post(
                f"{BACKEND_URL}/api/auth/login",
                json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
                timeout=5
            )

            if response.status_code == 200:
                self.log_test("后端登录API", "PASS")
                data = response.json()
                self.token = data.get('access_token')

                if self.token:
                    self.log_test("获取访问令牌", "PASS")
                else:
                    self.log_test("获取访问令牌", "FAIL", "响应中无token")
                    return False

                return True
            else:
                self.log_test("后端登录API", "FAIL", f"状态码: {response.status_code}")
                return False

        except Exception as e:
            self.log_test("后端登录API", "FAIL", str(e))
            return False

    def test_api_endpoints(self):
        """测试各个API端点的可访问性"""
        print(f"\n{BLUE}=== 测试API端点 ==={RESET}")

        if not self.token:
            print(f"{YELLOW}跳过API测试（未登录）{RESET}")
            return

        headers = {"Authorization": f"Bearer {self.token}"}

        endpoints = [
            ("GET", "/api/auth/me", "用户信息"),
            ("GET", "/api/wines", "红酒列表"),
            ("GET", "/api/wines/low-stock", "低库存红酒"),
            ("GET", "/api/wines/regions", "产区列表"),
            ("GET", "/api/wines/varieties", "葡萄品种列表"),
            ("GET", "/api/inventory", "库存交易记录"),
            ("GET", "/api/dashboard/summary", "仪表盘概览"),
            ("GET", "/api/dashboard/trends", "趋势数据"),
            ("GET", "/api/dashboard/distribution/region", "按产区分布"),
            ("GET", "/api/dashboard/distribution/variety", "按品种分布"),
            ("GET", "/api/users", "用户列表（管理员）"),
            ("GET", "/api/logs", "操作日志"),
        ]

        for method, endpoint, name in endpoints:
            try:
                if method == "GET":
                    response = requests.get(f"{BACKEND_URL}{endpoint}", headers=headers, timeout=5)
                else:
                    response = requests.request(method, f"{BACKEND_URL}{endpoint}", headers=headers, timeout=5)

                if response.status_code == 200:
                    self.log_test(f"{name} API", "PASS")
                elif response.status_code in [401, 403]:
                    self.log_test(f"{name} API", "WARN", f"权限问题 ({response.status_code})")
                else:
                    self.log_test(f"{name} API", "FAIL", f"状态码: {response.status_code}")

            except Exception as e:
                self.log_test(f"{name} API", "FAIL", str(e))

    def test_static_resources(self):
        """测试静态资源加载"""
        print(f"\n{BLUE}=== 测试静态资源 ==={RESET}")

        # 常见的静态资源路径
        resources = [
            "/assets/",  # Vite默认assets目录
            "/favicon.ico",
        ]

        for resource in resources:
            try:
                url = f"{FRONTEND_URL}{resource}"
                response = requests.head(url, timeout=5, allow_redirects=True)

                if response.status_code == 200:
                    self.log_test(f"静态资源: {resource}", "PASS")
                elif response.status_code == 404:
                    self.log_test(f"静态资源: {resource}", "WARN", "未找到")
                else:
                    self.log_test(f"静态资源: {resource}", "WARN", f"状态码: {response.status_code}")

            except Exception as e:
                self.log_test(f"静态资源: {resource}", "WARN", str(e))

    def test_cors_configuration(self):
        """测试CORS配置"""
        print(f"\n{BLUE}=== 测试CORS配置 ==={RESET}")

        try:
            # 模拟浏览器的预检请求
            response = requests.options(
                f"{BACKEND_URL}/api/wines",
                headers={
                    "Origin": FRONTEND_URL,
                    "Access-Control-Request-Method": "GET"
                },
                timeout=5
            )

            cors_allow_origin = response.headers.get('Access-Control-Allow-Origin')
            cors_allow_methods = response.headers.get('Access-Control-Allow-Methods')

            if cors_allow_origin:
                if FRONTEND_URL in cors_allow_origin or cors_allow_origin == '*':
                    self.log_test("CORS允许前端域名", "PASS", f"Origin: {cors_allow_origin}")
                else:
                    self.log_test("CORS允许前端域名", "WARN", f"Origin: {cors_allow_origin}")
            else:
                self.log_test("CORS允许前端域名", "WARN", "未设置CORS头")

            if cors_allow_methods and 'GET' in cors_allow_methods:
                self.log_test("CORS允许GET方法", "PASS")
            else:
                self.log_test("CORS允许GET方法", "WARN", f"Methods: {cors_allow_methods}")

        except Exception as e:
            self.log_test("CORS配置测试", "FAIL", str(e))

    def run_all_tests(self):
        """运行所有测试"""
        print(f"{BLUE}{'='*60}{RESET}")
        print(f"{BLUE}红酒库存管理系统 - 前端基础测试{RESET}")
        print(f"{BLUE}{'='*60}{RESET}")

        # 运行测试套件
        if self.test_frontend_service():
            if self.test_backend_integration():
                self.test_api_endpoints()
            self.test_static_resources()
            self.test_cors_configuration()
        else:
            print(f"\n{RED}前端服务未运行，无法继续测试{RESET}")
            print(f"{YELLOW}请先启动前端服务: cd frontend && npm run dev{RESET}")

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

def main():
    tester = BasicFrontendTester()
    tester.run_all_tests()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{YELLOW}测试被用户中断{RESET}")
        sys.exit(0)
