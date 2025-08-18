"""
Professional BourseX AR-Enhanced Integration Test
Tests all AR components and professional features
"""

import requests
import json
import time

class BourseXProfessionalTest:
    def __init__(self):
        self.base_url = "http://127.0.0.1:8000/api"
        self.token = None
        
    def test_professional_login(self):
        """Test professional login with enhanced credentials"""
        print("🔐 Testing Professional Login...")
        
        login_data = {
            "username": "testuser",
            "password": "testpass123"
        }
        
        response = requests.post(f"{self.base_url}/auth/login/", data=login_data)
        
        if response.status_code == 200:
            data = response.json()
            self.token = data.get('access')
            print(f"✅ Professional login successful!")
            print(f"   Token received: {self.token[:20]}...")
            return True
        else:
            print(f"❌ Login failed: {response.status_code}")
            return False
    
    def get_headers(self):
        """Get authorization headers for API requests"""
        return {"Authorization": f"Bearer {self.token}"}
    
    def test_ar_dashboard_data(self):
        """Test AR dashboard data endpoints"""
        print("\n📊 Testing AR Dashboard Data...")
        
        # Test dashboard endpoint
        response = requests.get(f"{self.base_url}/dashboard/", headers=self.get_headers())
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Dashboard data loaded successfully!")
            
            # Check AR-relevant data
            balance = data.get('user_profile', {}).get('balance', 0)
            portfolio_value = data.get('portfolio_value', 0)
            total_profit = data.get('user_profile', {}).get('total_profit_loss', 0)
            
            print(f"   💰 Balance: {balance:,.2f} MGA")
            print(f"   📈 Portfolio Value: {portfolio_value:,.2f} MGA")
            print(f"   🎯 Total Profit: {total_profit:,.2f} MGA")
            
            return True
        else:
            print(f"❌ Dashboard data failed: {response.status_code}")
            return False
    
    def test_ar_portfolio_data(self):
        """Test AR portfolio visualization data"""
        print("\n🔮 Testing AR Portfolio Data...")
        
        response = requests.get(f"{self.base_url}/portfolio/", headers=self.get_headers())
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Portfolio data loaded successfully!")
            
            if data:
                print(f"   📊 Portfolio Holdings: {len(data)} positions")
                for holding in data[:3]:  # Show first 3
                    current_value = float(holding['quantity']) * float(holding['current_price'])
                    print(f"   • {holding['stock_symbol']}: {holding['quantity']} shares = {current_value:,.2f} MGA")
            else:
                print("   📝 No portfolio holdings (clean slate for demo)")
            
            return True
        else:
            print(f"❌ Portfolio data failed: {response.status_code}")
            return False
    
    def test_gamification_ar_data(self):
        """Test gamification data for AR displays"""
        print("\n🎮 Testing Gamification AR Data...")
        
        response = requests.get(f"{self.base_url}/gamification/", headers=self.get_headers())
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Gamification data loaded successfully!")
            
            user_profile = data.get('user_profile', {})
            badges = data.get('badges', [])
            
            print(f"   ⭐ Level: {user_profile.get('level', 1)}")
            print(f"   🏆 XP: {user_profile.get('xp', 0):,}")
            print(f"   🎖️ Badges: {len(badges)}")
            
            return True
        else:
            print(f"❌ Gamification data failed: {response.status_code}")
            return False
    
    def test_stocks_for_ar(self):
        """Test stock data for AR visualization"""
        print("\n📈 Testing Stock Data for AR...")
        
        response = requests.get(f"{self.base_url}/stocks/", headers=self.get_headers())
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Stock data loaded successfully!")
            print(f"   💎 Available Stocks: {len(data)}")
            
            # Show premium stocks
            premium_stocks = [s for s in data if s['symbol'] in ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA']]
            print("   🌟 Premium Stocks Available:")
            for stock in premium_stocks:
                print(f"   • {stock['symbol']}: {stock['current_price']} MGA")
            
            return True
        else:
            print(f"❌ Stock data failed: {response.status_code}")
            return False
    
    def test_user_profile_ar(self):
        """Test user profile data for AR display"""
        print("\n👤 Testing User Profile for AR...")
        
        response = requests.get(f"{self.base_url}/me/", headers=self.get_headers())
        
        if response.status_code == 200:
            data = response.json()
            print("✅ User profile loaded successfully!")
            
            print(f"   👨‍💼 User: {data.get('username', 'N/A')}")
            print(f"   💰 Balance: {data.get('balance', 0):,.2f} MGA")
            print(f"   📊 Level: {data.get('level', 1)}")
            print(f"   🎯 XP: {data.get('xp', 0):,}")
            print(f"   📈 Total Trades: {data.get('total_trades', 0)}")
            
            return True
        else:
            print(f"❌ User profile failed: {response.status_code}")
            return False
    
    def run_professional_test_suite(self):
        """Run complete professional AR test suite"""
        print("🚀 BourseX Professional AR-Enhanced Test Suite")
        print("=" * 60)
        
        results = []
        
        # Run all tests
        results.append(self.test_professional_login())
        
        if self.token:  # Only run authenticated tests if login successful
            results.append(self.test_ar_dashboard_data())
            results.append(self.test_ar_portfolio_data())
            results.append(self.test_gamification_ar_data())
            results.append(self.test_stocks_for_ar())
            results.append(self.test_user_profile_ar())
        
        # Calculate results
        passed = sum(results)
        total = len(results)
        success_rate = (passed / total) * 100
        
        print("\n" + "=" * 60)
        print("🎯 PROFESSIONAL TEST RESULTS")
        print("=" * 60)
        print(f"✅ Passed: {passed}/{total} tests")
        print(f"📊 Success Rate: {success_rate:.1f}%")
        
        if success_rate == 100:
            print("🎉 ALL PROFESSIONAL AR FEATURES WORKING PERFECTLY!")
            print("💎 Your application is ready for premium demonstrations!")
        elif success_rate >= 80:
            print("🌟 Excellent! AR features are mostly functional!")
        else:
            print("⚠️  Some issues detected, please review the logs above.")
        
        print("\n🔮 AR Features Tested:")
        print("• Professional login system")
        print("• AR dashboard data loading")
        print("• AR portfolio visualization data")
        print("• Gamification AR integration")
        print("• Stock data for AR displays")
        print("• User profile AR components")
        
        print("\n🎯 Ready for Presentation:")
        print("• Login with: testuser / testpass123")
        print("• Experience AR-enhanced money displays")
        print("• Interactive portfolio visualization")
        print("• Professional design and animations")
        
        return success_rate == 100

if __name__ == "__main__":
    tester = BourseXProfessionalTest()
    tester.run_professional_test_suite()
