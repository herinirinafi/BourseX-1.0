"""
Quick API Test for BourseX Backend
Tests the key endpoints to ensure they're working
"""

import urllib.request
import urllib.parse
import json
import sys

def make_request(url, method="GET", data=None, headers=None):
    """Make HTTP request without external dependencies"""
    try:
        if headers is None:
            headers = {}
        
        if data:
            data = json.dumps(data).encode('utf-8')
            headers['Content-Type'] = 'application/json'
        
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        
        with urllib.request.urlopen(req, timeout=5) as response:
            result = {
                'status': response.getcode(),
                'data': response.read().decode('utf-8'),
                'headers': dict(response.headers)
            }
            return result
    except Exception as e:
        return {'error': str(e)}

def test_endpoints():
    """Test key API endpoints"""
    print("🧪 Testing BourseX API Endpoints")
    print("=" * 40)
    
    # Test basic connectivity
    print("\n1. Testing basic connectivity...")
    result = make_request("http://127.0.0.1:8000/api/")
    if 'error' in result:
        print(f"❌ API not reachable: {result['error']}")
        return False
    else:
        print(f"✅ API reachable: HTTP {result['status']}")
    
    # Test stocks endpoint
    print("\n2. Testing stocks endpoint...")
    result = make_request("http://127.0.0.1:8000/api/stocks/")
    if 'error' in result:
        print(f"❌ Stocks endpoint error: {result['error']}")
    else:
        print(f"✅ Stocks endpoint: HTTP {result['status']}")
        data = json.loads(result['data'])
        print(f"   Stocks available: {len(data)}")
    
    # Test login endpoint
    print("\n3. Testing login endpoint...")
    login_data = {"username": "testuser", "password": "testpass123"}
    result = make_request("http://127.0.0.1:8000/api/auth/login/", method="POST", data=login_data)
    
    if 'error' in result:
        print(f"❌ Login endpoint error: {result['error']}")
        return False
    else:
        print(f"✅ Login endpoint: HTTP {result['status']}")
        try:
            login_response = json.loads(result['data'])
            if 'access' in login_response:
                access_token = login_response['access']
                print(f"   Login successful, token received")
                
                # Test authenticated endpoint
                print("\n4. Testing authenticated endpoint...")
                auth_headers = {'Authorization': f'Bearer {access_token}'}
                me_result = make_request("http://127.0.0.1:8000/api/me/", headers=auth_headers)
                
                if 'error' in me_result:
                    print(f"❌ Me endpoint error: {me_result['error']}")
                else:
                    print(f"✅ Me endpoint: HTTP {me_result['status']}")
                    me_data = json.loads(me_result['data'])
                    print(f"   User: {me_data.get('profile', {}).get('user', 'Unknown')}")
                    print(f"   Balance: {me_data.get('profile', {}).get('balance', 'N/A')} Ar")
                
                return True
            else:
                print(f"❌ Login failed: {result['data']}")
                return False
        except json.JSONDecodeError:
            print(f"❌ Invalid login response format")
            return False

def main():
    print("🚀 BourseX Backend API Test")
    print("Testing key functionality...")
    
    success = test_endpoints()
    
    if success:
        print("\n🎉 All tests passed! Backend is working correctly.")
        print("\n📱 Frontend should be able to connect successfully.")
        print("   URL: http://localhost:8081")
        return True
    else:
        print("\n❌ Some tests failed. Check backend configuration.")
        print("   Make sure Django server is running: python manage.py runserver")
        return False

if __name__ == "__main__":
    main()
