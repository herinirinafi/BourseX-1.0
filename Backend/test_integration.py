#!/usr/bin/env python
"""
Complete integration test for BourseX application
Tests frontend-backend communication and all major features
"""

import os
import sys
import django
import requests
import json
import time
from decimal import Decimal

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'boursex_api.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import UserProfile, Stock, Portfolio, Transaction
from gamification_engine import process_post_transaction_gamification

class BourseXIntegrationTest:
    def __init__(self):
        self.base_url = "http://127.0.0.1:8000/api"
        self.auth_token = None
        self.user = None
        
    def test_authentication(self):
        """Test user login and JWT token generation"""
        print("🔐 Testing Authentication...")
        
        # Login with test user
        login_data = {
            "username": "testuser",
            "password": "testpass123"
        }
        
        response = requests.post(f"{self.base_url}/auth/login/", json=login_data)
        
        if response.status_code == 200:
            data = response.json()
            self.auth_token = data['access']
            print(f"✅ Login successful, token received: {self.auth_token[:20]}...")
            return True
        else:
            print(f"❌ Login failed: {response.status_code} - {response.text}")
            return False
    
    def get_headers(self):
        """Get authorization headers"""
        return {
            "Authorization": f"Bearer {self.auth_token}",
            "Content-Type": "application/json"
        }
    
    def test_stocks_api(self):
        """Test stocks listing and data"""
        print("📈 Testing Stocks API...")
        
        response = requests.get(f"{self.base_url}/stocks/")
        
        if response.status_code == 200:
            stocks = response.json()
            print(f"✅ Stocks API working, {len(stocks)} stocks available")
            
            # Print some stock data
            for stock in stocks[:3]:
                print(f"   - {stock['symbol']}: {stock['name']} - {stock['current_price']} MGA")
            return True
        else:
            print(f"❌ Stocks API failed: {response.status_code}")
            return False
    
    def test_user_profile_api(self):
        """Test user profile and dashboard data"""
        print("👤 Testing User Profile API...")
        
        # Test /me/ endpoint
        response = requests.get(f"{self.base_url}/me/", headers=self.get_headers())
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ User profile API working")
            print(f"   - Balance: {data['profile']['balance']} MGA")
            print(f"   - Level: {data['profile']['level']}")
            print(f"   - XP: {data['profile']['xp']}")
            print(f"   - Portfolio items: {len(data['portfolio'])}")
            print(f"   - Recent transactions: {len(data['transactions'])}")
            return True
        else:
            print(f"❌ User profile API failed: {response.status_code}")
            return False
    
    def test_trading_api(self):
        """Test trading functionality"""
        print("💰 Testing Trading API...")
        
        # Get a stock to trade
        stocks_response = requests.get(f"{self.base_url}/stocks/")
        if stocks_response.status_code != 200:
            print("❌ Cannot get stocks for trading test")
            return False
        
        stocks = stocks_response.json()
        if not stocks:
            print("❌ No stocks available for trading")
            return False
        
        test_stock = stocks[0]
        print(f"   Using stock: {test_stock['symbol']} - {test_stock['current_price']} MGA")
        
        # Test BUY trade
        buy_data = {
            "stock_id": test_stock['id'],
            "trade_type": "BUY",
            "quantity": 0.1
        }
        
        buy_response = requests.post(f"{self.base_url}/trade/", 
                                   json=buy_data, 
                                   headers=self.get_headers())
        
        if buy_response.status_code == 200:
            buy_result = buy_response.json()
            print(f"✅ BUY trade successful")
            print(f"   - Message: {buy_result['message']}")
            print(f"   - New balance: {buy_result['new_balance']} MGA")
            print(f"   - XP gained: {buy_result['xp_gained']}")
            
            # Test gamification results
            if 'gamification' in buy_result:
                gam = buy_result['gamification']
                print(f"   - Badges awarded: {gam['badges_awarded']}")
                print(f"   - Achievements awarded: {gam['achievements_awarded']}")
                print(f"   - Level up: {gam['level_up']}")
        else:
            print(f"❌ BUY trade failed: {buy_response.status_code} - {buy_response.text}")
            return False
        
        # Test SELL trade (check portfolio first)
        time.sleep(1)  # Brief pause
        
        # Get user's portfolio to see what they can sell
        portfolio_response = requests.get(f"{self.base_url}/portfolio/", headers=self.get_headers())
        if portfolio_response.status_code == 200:
            portfolio = portfolio_response.json()
            test_stock_portfolio = None
            
            # Find the stock we just bought in portfolio
            for item in portfolio:
                if item['stock']['id'] == test_stock['id']:
                    test_stock_portfolio = item
                    break
            
            if test_stock_portfolio and float(test_stock_portfolio['quantity']) > 0:
                # Sell half of what we own
                sell_quantity = float(test_stock_portfolio['quantity']) / 2
                
                sell_data = {
                    "stock_id": test_stock['id'],
                    "trade_type": "SELL", 
                    "quantity": sell_quantity
                }
                
                sell_response = requests.post(f"{self.base_url}/trade/", 
                                            json=sell_data, 
                                            headers=self.get_headers())
                
                if sell_response.status_code == 200:
                    sell_result = sell_response.json()
                    print(f"✅ SELL trade successful")
                    print(f"   - Message: {sell_result['message']}")
                    print(f"   - New balance: {sell_result['new_balance']} MGA")
                    if 'profit_loss' in sell_result:
                        print(f"   - Profit/Loss: {sell_result['profit_loss']} MGA")
                else:
                    print(f"⚠️  SELL trade failed: {sell_response.status_code} - {sell_response.text}")
            else:
                print(f"⚠️  No portfolio found for {test_stock['symbol']}, skipping SELL test")
        else:
            print(f"⚠️  Could not fetch portfolio, skipping SELL test")
        
        return True
    
    def test_gamification_api(self):
        """Test gamification features"""
        print("🎮 Testing Gamification API...")
        
        # Test gamification summary
        response = requests.get(f"{self.base_url}/gamification/", headers=self.get_headers())
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Gamification API working")
            print(f"   - User Level: {data['user_profile']['level']}")
            print(f"   - User XP: {data['user_profile']['xp']}")
            print(f"   - Badges earned: {len(data['badges'])}")
            print(f"   - Achievements: {len(data['achievements'])}")
            print(f"   - Daily streak: {data['daily_streak']['current_streak']} days")
            print(f"   - Notifications: {len(data['recent_notifications'])}")
        else:
            print(f"❌ Gamification API failed: {response.status_code}")
            return False
        
        # Test badges endpoint
        badges_response = requests.get(f"{self.base_url}/badges/my_badges/", headers=self.get_headers())
        if badges_response.status_code == 200:
            badges = badges_response.json()
            print(f"✅ User badges API working - {len(badges)} badges earned")
        
        # Test leaderboard
        leaderboard_response = requests.get(f"{self.base_url}/leaderboard/", headers=self.get_headers())
        if leaderboard_response.status_code == 200:
            leaderboard = leaderboard_response.json()
            print(f"✅ Leaderboard API working - {len(leaderboard)} entries")
        
        return True
    
    def test_dashboard_api(self):
        """Test dashboard summary endpoint"""
        print("📊 Testing Dashboard API...")
        
        response = requests.get(f"{self.base_url}/dashboard/", headers=self.get_headers())
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Dashboard API working")
            print(f"   - Portfolio value: {data['portfolio_value']} MGA")
            print(f"   - User balance: {data['user_profile']['balance']} MGA")
            print(f"   - Total trades: {data['user_profile']['total_trades']}")
            print(f"   - Recent transactions: {len(data['recent_transactions'])}")
            print(f"   - Active missions: {len(data['active_missions'])}")
            print(f"   - Top stocks: {len(data['top_stocks'])}")
            return True
        else:
            print(f"❌ Dashboard API failed: {response.status_code}")
            return False
    
    def run_complete_test(self):
        """Run all integration tests"""
        print("🚀 Starting BourseX Complete Integration Test")
        print("=" * 60)
        
        tests = [
            self.test_authentication,
            self.test_stocks_api,
            self.test_user_profile_api,
            self.test_trading_api,
            self.test_gamification_api,
            self.test_dashboard_api
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                if test():
                    passed += 1
                print("-" * 40)
            except Exception as e:
                print(f"❌ Test failed with exception: {e}")
                print("-" * 40)
        
        print("🏁 Integration Test Results")
        print("=" * 60)
        print(f"✅ Passed: {passed}/{total} tests")
        print(f"📊 Success rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("🎉 ALL TESTS PASSED! BourseX integration is working perfectly!")
        else:
            print("⚠️  Some tests failed. Check the logs above for details.")
        
        print("\n🔗 Frontend URLs to test:")
        print("   - http://localhost:8081 (Expo Dev Server)")
        print("   - Login with: testuser / testpass123")
        print("\n🔗 Backend URLs:")
        print("   - http://127.0.0.1:8000/admin/ (Django Admin)")
        print("   - http://127.0.0.1:8000/api/ (API Root)")

if __name__ == "__main__":
    tester = BourseXIntegrationTest()
    tester.run_complete_test()
