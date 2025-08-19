#!/usr/bin/env python3
"""
Test admin login functionality and verify admin user credentials
"""
import requests
import json
import sys

BASE_URL = 'http://127.0.0.1:8000'

def test_admin_login():
    """Test login with admin credentials"""
    
    # Test with Admin user
    print("🔐 Testing admin login...")
    
    login_data = {
        'username': 'Admin',
        'password': 'admin'
    }
    
    try:
        response = requests.post(f'{BASE_URL}/api/auth/login/', json=login_data)
        print(f"📊 Login response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login successful!")
            print(f"🎫 Access Token: {data.get('access', 'N/A')[:50]}...")
            print(f"🔄 Refresh Token: {data.get('refresh', 'N/A')[:50]}...")
            
            # Test getting current user with the token
            headers = {'Authorization': f'Bearer {data.get("access")}'}
            user_response = requests.get(f'{BASE_URL}/api/auth/user/', headers=headers)
            
            if user_response.status_code == 200:
                user_data = user_response.json()
                print("👤 User profile:")
                print(f"   Username: {user_data.get('username')}")
                print(f"   Email: {user_data.get('email')}")
                print(f"   Staff: {user_data.get('is_staff')}")
                print(f"   Active: {user_data.get('is_active')}")
                print(f"   Admin Access: {'✅ YES' if user_data.get('is_staff') else '❌ NO'}")
                
                return {
                    'success': True,
                    'tokens': data,
                    'user': user_data
                }
            else:
                print(f"❌ Failed to get user profile: {user_response.status_code}")
                print(user_response.text)
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Error during login test: {e}")
    
    return None

def main():
    print("🚀 Admin Login Test")
    print("=" * 50)
    
    result = test_admin_login()
    
    if result:
        print("\n" + "=" * 50)
        print("✅ SUCCESS: Admin login working!")
        print("\n📋 Copy these tokens to your browser localStorage:")
        print(f"   authToken: {result['tokens']['access']}")
        print(f"   refreshToken: {result['tokens']['refresh']}")
        print("\n💡 To manually set tokens in browser console:")
        print("   localStorage.setItem('authToken', 'YOUR_ACCESS_TOKEN');")
        print("   localStorage.setItem('refreshToken', 'YOUR_REFRESH_TOKEN');")
        print("   window.location.reload();")
    else:
        print("\n❌ FAILED: Check admin user credentials")

if __name__ == '__main__':
    main()
