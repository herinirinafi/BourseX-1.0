#!/usr/bin/env python3
"""
Test script to verify portfolio API is working correctly
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_login():
    """Test login and get token"""
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/login/", json=login_data)
    print(f"Login Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        token = data.get('access')
        print(f"Login successful! Token: {token[:20]}...")
        return token
    else:
        print(f"Login failed: {response.text}")
        return None

def test_me_endpoint(token):
    """Test the /api/me/ endpoint"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(f"{BASE_URL}/api/me/", headers=headers)
    print(f"\n/api/me/ Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"User Data:")
        print(f"- Email: {data.get('email')}")
        print(f"- Balance: {data.get('balance')} Ar")
        print(f"- Portfolio Items: {len(data.get('portfolio', []))}")
        
        for item in data.get('portfolio', []):
            print(f"  * {item.get('symbol')}: {item.get('quantity')} @ {item.get('current_price')} = {item.get('current_value')} Ar")
        
        return data
    else:
        print(f"/api/me/ failed: {response.text}")
        return None

def test_portfolio_endpoint(token):
    """Test the /api/portfolio/ endpoint"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(f"{BASE_URL}/api/portfolio/", headers=headers)
    print(f"\n/api/portfolio/ Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Portfolio Data:")
        for item in data:
            print(f"  * {item.get('symbol')}: {item.get('quantity')} @ {item.get('current_price')} = {item.get('current_value')} Ar")
        
        return data
    else:
        print(f"/api/portfolio/ failed: {response.text}")
        return None

if __name__ == "__main__":
    print("Testing Portfolio API Fix...")
    print("=" * 50)
    
    # Test login
    token = test_login()
    
    if token:
        # Test both endpoints
        me_data = test_me_endpoint(token)
        portfolio_data = test_portfolio_endpoint(token)
        
        # Calculate total portfolio value
        if me_data and 'portfolio' in me_data:
            total_value = sum(float(item.get('current_value', 0)) for item in me_data['portfolio'])
            print(f"\nCalculated Total Portfolio Value: {total_value} Ar")
            
            if total_value > 0:
                print("✅ SUCCESS: Portfolio has value!")
            else:
                print("❌ PROBLEM: Portfolio value is still 0")
    
    print("\n" + "=" * 50)
    print("Test complete!")
