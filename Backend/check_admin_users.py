#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'boursex_api.settings')
django.setup()

from django.contrib.auth.models import User

print("=== Admin Users Check ===")
admin_users = User.objects.filter(is_staff=True)
print(f"Total admin users found: {admin_users.count()}")

if admin_users.exists():
    print("\nAdmin users:")
    for user in admin_users:
        print(f"- Username: {user.username}")
        print(f"  Email: {user.email}")
        print(f"  Is Staff: {user.is_staff}")
        print(f"  Is Active: {user.is_active}")
        print(f"  Is Superuser: {user.is_superuser}")
        print()
else:
    print("\n❌ No admin users found!")
    print("\n📝 Creating a demo admin user...")
    try:
        admin_user = User.objects.create_user(
            username='admin',
            email='admin@boursex.com',
            password='admin123',
            is_staff=True,
            is_superuser=True
        )
        print(f"✅ Admin user created: {admin_user.username}")
        print("📋 Login credentials:")
        print("   Username: admin")
        print("   Password: admin123")
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")

print("\n=== All Users ===")
all_users = User.objects.all()
print(f"Total users: {all_users.count()}")
for user in all_users:
    print(f"- {user.username} (staff: {user.is_staff}, active: {user.is_active})")
