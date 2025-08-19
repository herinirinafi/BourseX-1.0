#!/usr/bin/env python3
"""
Reset admin password for testing
"""
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'boursex_api.settings')
django.setup()

from django.contrib.auth.models import User

def reset_admin_password():
    """Reset admin password to ensure we can login"""
    try:
        user = User.objects.get(username='Admin')
        user.set_password('admin123')
        user.save()
        print(f"✅ Password reset for user: {user.username}")
        print(f"   Is staff: {user.is_staff}")
        print(f"   Is active: {user.is_active}")
        print(f"   New password: admin123")
        
        # Also reset manitriniaina if exists
        try:
            user2 = User.objects.get(username='manitriniaina')
            user2.set_password('admin123')
            user2.save()
            print(f"✅ Password reset for user: {user2.username}")
        except User.DoesNotExist:
            pass
            
    except User.DoesNotExist:
        print("❌ Admin user not found")

if __name__ == '__main__':
    reset_admin_password()
