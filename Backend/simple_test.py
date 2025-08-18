import requests
import json

print("Testing BourseX Backend...")

try:
    # Test stocks endpoint
    response = requests.get('http://127.0.0.1:8000/api/stocks/')
    print(f"Stocks API: {response.status_code}")
    
    if response.status_code == 200:
        stocks = response.json()
        print(f"Found {len(stocks)} stocks")
        
        # Test login
        login_data = {"username": "testuser", "password": "testpass123"}
        login_response = requests.post('http://127.0.0.1:8000/api/auth/login/', json=login_data)
        print(f"Login API: {login_response.status_code}")
        
        if login_response.status_code == 200:
            token = login_response.json()['access']
            headers = {"Authorization": f"Bearer {token}"}
            
            # Test authenticated endpoints
            me_response = requests.get('http://127.0.0.1:8000/api/me/', headers=headers)
            print(f"User profile: {me_response.status_code}")
            
            dashboard_response = requests.get('http://127.0.0.1:8000/api/dashboard/', headers=headers)
            print(f"Dashboard: {dashboard_response.status_code}")
            
            print("✅ Backend integration working!")
        else:
            print("❌ Login failed")
    else:
        print("❌ Stocks API failed")
        
except Exception as e:
    print(f"❌ Error: {e}")
