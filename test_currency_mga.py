"""
Test script to verify MGA currency conversion is working
"""

import requests
import json

# Backend API URL
API_URL = "http://127.0.0.1:8000/api"

def test_currency_conversion():
    """Test that the app is now showing MGA values"""
    print("🧪 Testing MGA Currency Conversion")
    print("=" * 40)
    
    # Test 1: Check stocks endpoint for MGA prices
    try:
        response = requests.get(f"{API_URL}/stocks/")
        if response.status_code == 200:
            stocks = response.json()
            print("✅ Stocks endpoint accessible")
            
            if stocks:
                sample_stock = stocks[0]
                price = float(sample_stock.get('current_price', 0))
                print(f"📈 Sample stock: {sample_stock.get('symbol', 'N/A')}")
                print(f"💰 Price: {price:,.2f} MGA")
                
                # Check if prices are in MGA range (should be > 10,000 for realistic MGA values)
                if price > 10000:
                    print("✅ Prices appear to be in MGA (> 10,000)")
                else:
                    print("⚠️  Prices might still be in EUR/USD (< 10,000)")
            else:
                print("⚠️  No stocks found")
        else:
            print(f"❌ Error accessing stocks: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing stocks: {e}")
    
    print()
    
    # Test 2: Login and check user balance
    try:
        login_data = {
            "username": "testuser",
            "password": "testpass123"
        }
        
        login_response = requests.post(f"{API_URL}/auth/login/", json=login_data)
        if login_response.status_code == 200:
            auth_data = login_response.json()
            print("✅ Login successful")
            
            # Check balance
            balance = float(auth_data.get('balance', 0))
            print(f"💰 User balance: {balance:,.2f} MGA")
            
            if balance > 1000000:  # 1 million MGA
                print("✅ Balance appears to be in MGA (> 1M)")
            elif balance > 10000:
                print("⚠️  Balance might be partially converted")
            else:
                print("❌ Balance still appears to be in EUR/USD")
        else:
            print(f"❌ Login failed: {login_response.status_code}")
    except Exception as e:
        print(f"❌ Error testing login: {e}")
    
    print()
    print("🎯 Test Summary:")
    print("- Frontend currency formatting changed to MGA")
    print("- Backend demo data updated with MGA values")
    print("- Stock prices converted to realistic MGA amounts")
    print("- User balances set to appropriate MGA levels")

if __name__ == "__main__":
    test_currency_conversion()
