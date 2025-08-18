import urllib.request
import urllib.parse
import json

print("🔍 Testing Portfolio API with urllib...")

# Step 1: Login
login_data = {
    "username": "testuser", 
    "password": "testpass123"
}

try:
    # Login request
    print("1. Testing login...")
    login_json = json.dumps(login_data).encode('utf-8')
    login_req = urllib.request.Request(
        'http://localhost:8000/api/auth/login/',
        data=login_json,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    with urllib.request.urlopen(login_req) as response:
        login_result = json.loads(response.read().decode('utf-8'))
        access_token = login_result.get('access')
        print(f"✅ Login successful, token: {access_token[:20]}...")
    
    # Portfolio request
    print("\n2. Testing portfolio endpoint...")
    portfolio_req = urllib.request.Request(
        'http://localhost:8000/api/portfolio/',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    with urllib.request.urlopen(portfolio_req) as response:
        portfolio_data = json.loads(response.read().decode('utf-8'))
        print(f"✅ Portfolio API working")
        print(f"Portfolio items: {len(portfolio_data)}")
        
        for item in portfolio_data:
            print(f"\n📊 Portfolio Item:")
            print(f"  Stock: {item.get('stock', {}).get('symbol', 'Unknown')}")
            print(f"  Quantity: {item.get('quantity', 0)}")
            print(f"  Average Price: {item.get('average_price', 0)} Ar")
            print(f"  Current Value: {item.get('current_value', 0)} Ar")
            print(f"  Profit/Loss: {item.get('profit_loss', 0)} Ar")
    
    # Me endpoint
    print("\n3. Testing /api/me/ endpoint...")
    me_req = urllib.request.Request(
        'http://localhost:8000/api/me/',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    with urllib.request.urlopen(me_req) as response:
        me_data = json.loads(response.read().decode('utf-8'))
        print(f"✅ Me API working")
        
        profile = me_data.get('profile', {})
        portfolio = me_data.get('portfolio', [])
        
        print(f"\n👤 User Profile:")
        print(f"  Balance: {profile.get('balance', 0)} Ar")
        print(f"  Total trades: {profile.get('total_trades', 0)}")
        
        print(f"\n💼 Portfolio Summary:")
        print(f"  Portfolio items: {len(portfolio)}")
        total_value = sum(item.get('current_value', 0) for item in portfolio)
        print(f"  Total portfolio value: {total_value} Ar")
        
        print(f"\n🔍 DIAGNOSIS:")
        if total_value == 0:
            print("❌ PROBLEM FOUND: Portfolio value is showing as 0 in API response!")
            print("   This means the issue is in the backend serializer.")
        else:
            print("✅ Portfolio value is correct in API response.")
            print("   The issue might be in the frontend display.")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
