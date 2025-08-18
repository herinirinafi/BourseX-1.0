import requests
import json

# Test login and portfolio API
print("🔍 Testing Portfolio API...")

# Step 1: Login
login_data = {
    "username": "testuser",
    "password": "testpass123"
}

try:
    print("1. Testing login...")
    login_response = requests.post("http://localhost:8000/api/auth/login/", json=login_data)
    print(f"Login status: {login_response.status_code}")
    
    if login_response.status_code == 200:
        tokens = login_response.json()
        access_token = tokens.get('access')
        print("✅ Login successful")
        
        # Step 2: Test portfolio endpoint
        print("\n2. Testing portfolio endpoint...")
        headers = {'Authorization': f'Bearer {access_token}'}
        
        portfolio_response = requests.get("http://localhost:8000/api/portfolio/", headers=headers)
        print(f"Portfolio status: {portfolio_response.status_code}")
        
        if portfolio_response.status_code == 200:
            portfolio_data = portfolio_response.json()
            print("✅ Portfolio API working")
            print(f"Portfolio items: {len(portfolio_data)}")
            
            for item in portfolio_data:
                print(f"\n📊 Portfolio Item:")
                print(f"  Stock: {item.get('stock', {}).get('symbol', 'Unknown')}")
                print(f"  Quantity: {item.get('quantity', 0)}")
                print(f"  Average Price: {item.get('average_price', 0)} Ar")
                print(f"  Current Value: {item.get('current_value', 0)} Ar")
                print(f"  Profit/Loss: {item.get('profit_loss', 0)} Ar")
        else:
            print(f"❌ Portfolio API error: {portfolio_response.text}")
            
        # Step 3: Test /api/me/ endpoint
        print("\n3. Testing /api/me/ endpoint...")
        me_response = requests.get("http://localhost:8000/api/me/", headers=headers)
        print(f"Me endpoint status: {me_response.status_code}")
        
        if me_response.status_code == 200:
            me_data = me_response.json()
            print("✅ Me API working")
            profile = me_data.get('profile', {})
            portfolio = me_data.get('portfolio', [])
            
            print(f"\n👤 User Profile:")
            print(f"  Balance: {profile.get('balance', 0)} Ar")
            print(f"  Total trades: {profile.get('total_trades', 0)}")
            
            print(f"\n💼 Portfolio Summary:")
            print(f"  Portfolio items: {len(portfolio)}")
            total_value = sum(item.get('current_value', 0) for item in portfolio)
            print(f"  Total portfolio value: {total_value} Ar")
        else:
            print(f"❌ Me API error: {me_response.text}")
            
    else:
        print(f"❌ Login failed: {login_response.text}")

except Exception as e:
    print(f"❌ Error: {e}")
    print("Make sure the Django server is running: python manage.py runserver")
