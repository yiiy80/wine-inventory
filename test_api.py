#!/usr/bin/env python3
"""
API Testing Script for Wine Inventory Management System
Tests all API endpoints and reports results
"""
import requests
import json
from typing import Dict, Any, Optional

BASE_URL = "http://localhost:8000/api"

class APITester:
    def __init__(self):
        self.token = None
        self.user = None
        self.test_results = []
        self.wine_id = None

    def test(self, name: str, method: str, endpoint: str,
             data: Optional[Dict] = None,
             expected_status: int = 200,
             headers: Optional[Dict] = None,
             debug: bool = False) -> bool:
        """Execute a test and record result"""
        url = f"{BASE_URL}{endpoint}"
        test_headers = headers or {}

        if self.token and 'Authorization' not in test_headers:
            test_headers['Authorization'] = f"Bearer {self.token}"

        if debug:
            print(f"  DEBUG: URL={url}")
            print(f"  DEBUG: Headers={test_headers}")
            print(f"  DEBUG: Data={data}")

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            result = {
                'name': name,
                'method': method,
                'endpoint': endpoint,
                'status_code': response.status_code,
                'expected_status': expected_status,
                'success': success,
                'response': response.json() if response.text else None
            }
            self.test_results.append(result)

            status = "[PASS]" if success else "[FAIL]"
            print(f"{status} [{method}] {name} - {response.status_code}")

            return success
        except Exception as e:
            print(f"[ERROR] [{method}] {name} - {str(e)}")
            self.test_results.append({
                'name': name,
                'success': False,
                'error': str(e)
            })
            return False

    def run_tests(self):
        print("=" * 80)
        print("Wine Inventory API Testing")
        print("=" * 80)

        # Test Authentication
        print("\n[Testing Authentication APIs]")
        if self.test("Login", "POST", "/auth/login", {
            "email": "admin@wine.com",
            "password": "admin123",
            "remember_me": False
        }):
            last_result = self.test_results[-1]
            self.token = last_result['response']['access_token']
            self.user = last_result['response']['user']
            print(f"  -> Token acquired for user: {self.user['email']}")
            print(f"  -> Token (first 50 chars): {self.token[:50]}...")

        self.test("Get current user", "GET", "/auth/me", debug=True)

        # Test Wines API
        print("\n[Testing Wines APIs]")
        self.test("List wines", "GET", "/wines")

        # Create a wine for testing
        if self.test("Create wine", "POST", "/wines", {
            "name": "测试红酒",
            "vintage_year": 2020,
            "region": "波尔多",
            "grape_variety": "赤霞珠",
            "price": 299.99,
            "supplier": "测试供应商",
            "storage_location": "A-1-001",
            "current_stock": 100,
            "low_stock_threshold": 20,
            "notes": "测试用红酒"
        }, expected_status=201):
            last_result = self.test_results[-1]
            self.wine_id = last_result['response']['id']
            print(f"  → Created wine with ID: {self.wine_id}")

        if self.wine_id:
            self.test(f"Get wine by ID", "GET", f"/wines/{self.wine_id}")
            self.test(f"Update wine", "PUT", f"/wines/{self.wine_id}", {
                "name": "测试红酒-更新",
                "notes": "已更新"
            })
            self.test("Get low stock wines", "GET", "/wines/low-stock")
            self.test("Get regions", "GET", "/wines/regions")
            self.test("Get varieties", "GET", "/wines/varieties")
            self.test("Get suppliers", "GET", "/wines/suppliers")
            self.test("Get locations", "GET", "/wines/locations")

        # Test Inventory API
        print("\n[Testing Inventory APIs]")
        self.test("List transactions", "GET", "/inventory")

        if self.wine_id:
            # Stock in
            if self.test("Stock in", "POST", "/inventory/in", {
                "wine_id": self.wine_id,
                "quantity": 50,
                "reason": "采购入库"
            }, expected_status=201):
                print(f"  → Stocked in 50 units")

            # Stock out
            if self.test("Stock out", "POST", "/inventory/out", {
                "wine_id": self.wine_id,
                "quantity": 30,
                "reason": "销售出库"
            }, expected_status=201):
                print(f"  → Stocked out 30 units")

            self.test("Get wine transactions", "GET", f"/inventory/wine/{self.wine_id}")

            # Test stock out validation (insufficient stock)
            self.test("Stock out - insufficient", "POST", "/inventory/out", {
                "wine_id": self.wine_id,
                "quantity": 10000,
                "reason": "测试不足"
            }, expected_status=400)

        # Test Dashboard API
        print("\n[Testing Dashboard APIs]")
        self.test("Dashboard summary", "GET", "/dashboard/summary")
        self.test("Dashboard trends", "GET", "/dashboard/trends")
        self.test("Dashboard distribution by region", "GET", "/dashboard/distribution/region")
        self.test("Dashboard distribution by variety", "GET", "/dashboard/distribution/variety")

        # Test Users API (admin only)
        print("\n[Testing Users APIs]")
        self.test("List users", "GET", "/users")

        # Use a unique email with timestamp to avoid conflicts
        import time
        test_email = f"test{int(time.time())}@wine.com"
        self.test("Create user", "POST", "/users", {
            "email": test_email,
            "name": "测试用户",
            "password": "test12345",
            "role": "user"
        }, expected_status=201)

        # Test Logs API
        print("\n[Testing Logs APIs]")
        self.test("List operation logs", "GET", "/logs")

        # Test Export API
        print("\n[Testing Export APIs]")
        # Note: Export endpoints return files, not JSON
        # self.test("Export wines", "GET", "/export/wines")
        # self.test("Export transactions", "GET", "/export/transactions")

        # Cleanup: Delete test wine
        if self.wine_id:
            self.test(f"Delete wine", "DELETE", f"/wines/{self.wine_id}", expected_status=204)

        # Print summary
        self.print_summary()

    def print_summary(self):
        print("\n" + "=" * 80)
        print("Test Summary")
        print("=" * 80)

        total = len(self.test_results)
        passed = sum(1 for r in self.test_results if r.get('success', False))
        failed = total - passed

        print(f"Total Tests: {total}")
        print(f"Passed: {passed} ({passed/total*100:.1f}%)")
        print(f"Failed: {failed} ({failed/total*100:.1f}%)")

        if failed > 0:
            print("\nFailed Tests:")
            for r in self.test_results:
                if not r.get('success', False):
                    print(f"  - {r['name']}")
                    if 'error' in r:
                        print(f"    Error: {r['error']}")
                    elif 'status_code' in r:
                        print(f"    Status: {r['status_code']} (expected {r['expected_status']})")
                        if r.get('response'):
                            print(f"    Response: {r['response']}")

        print("=" * 80)

if __name__ == "__main__":
    tester = APITester()
    tester.run_tests()
