#!/usr/bin/env python
"""
Script to create a test user for the BourseX application
"""

import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'boursex_api.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import UserProfile

def create_test_user():
    """Create a test user with profile"""
    username = 'testuser'
    password = 'testpass123'
    email = 'test@boursex.com'
    
    # Check if user already exists
    if User.objects.filter(username=username).exists():
        print(f"✅ User '{username}' already exists")
        user = User.objects.get(username=username)
    else:
        # Create user
        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            first_name='Test',
            last_name='User'
        )
        print(f"✅ Created user '{username}' with password '{password}'")
    
    # Create or get user profile
    profile, created = UserProfile.objects.get_or_create(
        user=user,
        defaults={
            'balance': 10000.00,
            'xp': 0,
            'level': 1,
            'total_profit_loss': 0.00,
            'total_trades': 0,
            'successful_trades': 0,
            'trading_score': 0.00,
            'risk_tolerance': 'MEDIUM'
        }
    )
    
    if created:
        print(f"✅ Created profile for user '{username}' with balance: {profile.balance} MGA")
    else:
        print(f"✅ Profile already exists for user '{username}' with balance: {profile.balance} MGA")
    
    print("\n🎯 LOGIN CREDENTIALS:")
    print(f"   Username: {username}")
    print(f"   Password: {password}")
    print(f"   Email: {email}")
    print(f"   Balance: {profile.balance} MGA")

if __name__ == '__main__':
    create_test_user()
