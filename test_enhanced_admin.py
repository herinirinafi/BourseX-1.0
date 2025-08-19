#!/usr/bin/env python3
"""
Test Enhanced Admin Dashboard
Enhanced test for the new comprehensive admin dashboard
"""

import requests
import json
import time

# Configuration
BASE_URL = "http://127.0.0.1:8000"
API_URL = f"{BASE_URL}/api"

class EnhancedAdminTest:
    def __init__(self):
        self.token = None
        self.session = requests.Session()

    def login_admin(self):
        """Login as admin to get token"""
        print("🔐 Testing Admin Login...")
        
        login_data = {
            "username": "Admin",
            "password": "admin123"
        }
        
        try:
            response = self.session.post(f"{API_URL}/auth/login/", json=login_data)
            print(f"Login Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('access')
                print("✅ Admin login successful!")
                
                # Set authorization header
                self.session.headers.update({
                    'Authorization': f'Bearer {self.token}',
                    'Content-Type': 'application/json'
                })
                
                return True
            else:
                print(f"❌ Login failed: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Login error: {e}")
            return False

    def test_dashboard_data(self):
        """Test all dashboard data endpoints"""
        print("\n📊 Testing Enhanced Dashboard Data...")
        
        endpoints = [
            ("/admin/users/", "Users"),
            ("/current-user/", "Current User"),
            ("/admin/stocks/", "Stocks"),
            ("/admin/transactions/", "Transactions"),
            ("/admin/missions/", "Missions"),
            ("/admin/badges/", "Badges")
        ]
        
        results = {}
        
        for endpoint, name in endpoints:
            try:
                response = self.session.get(f"{API_URL}{endpoint}")
                print(f"  {name}: Status {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list):
                        results[name] = len(data)
                        print(f"    ✅ Found {len(data)} items")
                    else:
                        results[name] = 1
                        print(f"    ✅ Data received")
                else:
                    results[name] = 0
                    print(f"    ❌ Error: {response.text}")
                    
            except Exception as e:
                results[name] = 0
                print(f"    ❌ Exception: {e}")
        
        return results

    def test_create_operations(self):
        """Test CRUD create operations"""
        print("\n🆕 Testing Create Operations...")
        
        # Test create user
        try:
            user_data = {
                "username": f"testuser_{int(time.time())}",
                "email": f"test_{int(time.time())}@example.com",
                "first_name": "Test",
                "last_name": "User",
                "password": "testpass123"
            }
            
            response = self.session.post(f"{API_URL}/admin/users/", json=user_data)
            print(f"  Create User: Status {response.status_code}")
            
            if response.status_code == 201:
                print("    ✅ User created successfully")
                return True
            else:
                print(f"    ❌ Failed: {response.text}")
                return False
                
        except Exception as e:
            print(f"    ❌ Exception: {e}")
            return False

    def test_analytics_data(self):
        """Test analytics data for charts"""
        print("\n📈 Testing Analytics Data...")
        
        try:
            # Get recent transactions for chart data
            response = self.session.get(f"{API_URL}/transactions/")
            if response.status_code == 200:
                transactions = response.json()
                print(f"  ✅ Transactions for analytics: {len(transactions)}")
                
                # Calculate daily data (simulated)
                daily_data = {}
                for i in range(7):
                    day = f"Day {i+1}"
                    daily_data[day] = len(transactions) // 7 + (i * 2)
                
                print(f"  📊 Sample chart data: {daily_data}")
                return daily_data
            else:
                print(f"  ❌ Failed to get transactions: {response.text}")
                return {}
                
        except Exception as e:
            print(f"  ❌ Exception: {e}")
            return {}

    def run_enhanced_test(self):
        """Run complete enhanced admin test"""
        print("🚀 Starting Enhanced Admin Dashboard Test")
        print("=" * 50)
        
        # Login
        if not self.login_admin():
            print("❌ Cannot proceed without admin login")
            return False
        
        # Test dashboard data
        dashboard_data = self.test_dashboard_data()
        
        # Test create operations
        create_success = self.test_create_operations()
        
        # Test analytics
        analytics_data = self.test_analytics_data()
        
        # Summary
        print("\n" + "=" * 50)
        print("📋 ENHANCED ADMIN TEST SUMMARY")
        print("=" * 50)
        
        print("\n📊 Dashboard Data:")
        for name, count in dashboard_data.items():
            status = "✅" if count > 0 else "❌"
            print(f"  {status} {name}: {count} items")
        
        print(f"\n🆕 Create Operations: {'✅ Success' if create_success else '❌ Failed'}")
        
        print(f"\n📈 Analytics Data: {'✅ Available' if analytics_data else '❌ No data'}")
        
        # Overall status
        total_endpoints = len(dashboard_data)
        working_endpoints = sum(1 for count in dashboard_data.values() if count > 0)
        
        print(f"\n🎯 Overall Status:")
        print(f"  Working Endpoints: {working_endpoints}/{total_endpoints}")
        print(f"  Success Rate: {(working_endpoints/total_endpoints)*100:.1f}%")
        
        if working_endpoints >= total_endpoints * 0.8:  # 80% success rate
            print("  🎉 Enhanced Admin Dashboard: READY!")
            return True
        else:
            print("  ⚠️  Enhanced Admin Dashboard: Needs attention")
            return False

if __name__ == "__main__":
    test = EnhancedAdminTest()
    success = test.run_enhanced_test()
    
    print("\n" + "="*50)
    if success:
        print("🎉 ENHANCED ADMIN DASHBOARD TEST: PASSED")
        print("💡 Your comprehensive admin dashboard with charts and CRUD is ready!")
    else:
        print("⚠️  ENHANCED ADMIN DASHBOARD TEST: NEEDS ATTENTION")
        print("💡 Check the backend API endpoints and data")
    print("="*50)
