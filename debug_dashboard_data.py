#!/usr/bin/env python3
"""
Debug Admin Dashboard Data Display Issue
"""

import requests
import json

# Configuration
BASE_URL = "http://127.0.0.1:8000"
API_URL = f"{BASE_URL}/api"

def debug_admin_dashboard():
    """Debug why dashboard data isn't displaying"""
    print("🔍 Debugging Admin Dashboard Data Display")
    print("=" * 50)
    
    # Test login first
    session = requests.Session()
    login_data = {"username": "Admin", "password": "admin123"}
    
    try:
        response = session.post(f"{API_URL}/auth/login/", json=login_data)
        if response.status_code == 200:
            token = response.json().get('access')
            session.headers.update({
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            })
            print("✅ Admin login successful")
        else:
            print(f"❌ Login failed: {response.text}")
            return
    except Exception as e:
        print(f"❌ Login error: {e}")
        return
    
    print("\n📊 Testing Admin Dashboard Endpoints:")
    
    # Test dashboard stats
    try:
        print("\n1. Testing /admin/dashboard-stats/")
        response = session.get(f"{API_URL}/admin/dashboard-stats/")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Stats data received")
            print(f"   Structure: {json.dumps(data, indent=2)[:300]}...")
            
            # Check key fields that dashboard expects
            if 'users' in data and 'trading' in data and 'gamification' in data:
                print("   ✅ Required fields present: users, trading, gamification")
                
                # Check users data
                users_data = data.get('users', {})
                print(f"   Users: total={users_data.get('total')}, active={users_data.get('active')}")
                print(f"   Balance: total={users_data.get('total_balance')}, avg={users_data.get('avg_balance')}")
                
                # Check trading data
                trading_data = data.get('trading', {})
                print(f"   Trading: stocks={trading_data.get('total_stocks')}, transactions={trading_data.get('total_transactions')}")
                
                # Check gamification data
                gamification_data = data.get('gamification', {})
                print(f"   Gamification: missions={gamification_data.get('total_missions')}, badges={gamification_data.get('total_badges')}")
                
            else:
                print("   ❌ Missing required fields!")
                print(f"   Available fields: {list(data.keys())}")
        else:
            print(f"   ❌ Error: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Exception: {e}")
    
    # Test users endpoint
    try:
        print("\n2. Testing /admin/users/")
        response = session.get(f"{API_URL}/admin/users/")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"   ✅ Users list: {len(data)} users")
            elif isinstance(data, dict) and 'results' in data:
                print(f"   ✅ Paginated users: {len(data['results'])} users")
            else:
                print(f"   ⚠️  Unexpected format: {type(data)}")
        else:
            print(f"   ❌ Error: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Exception: {e}")
    
    # Test stocks endpoint
    try:
        print("\n3. Testing /admin/stocks/")
        response = session.get(f"{API_URL}/admin/stocks/")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"   ✅ Stocks list: {len(data)} stocks")
            elif isinstance(data, dict) and 'results' in data:
                print(f"   ✅ Paginated stocks: {len(data['results'])} stocks")
            else:
                print(f"   ⚠️  Unexpected format: {type(data)}")
        else:
            print(f"   ❌ Error: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Exception: {e}")
    
    print("\n🔧 Diagnosis:")
    print("If all endpoints return 200 with data, the issue might be:")
    print("1. Frontend authentication token issues")
    print("2. API call error handling in authService")
    print("3. State management issues in React component")
    print("4. Conditional rendering logic problems")
    
    print("\n💡 Check the browser console for JavaScript errors!")

if __name__ == "__main__":
    debug_admin_dashboard()
