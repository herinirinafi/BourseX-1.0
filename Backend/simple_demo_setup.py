import os
import django
import sys

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'boursex_api.settings')
django.setup()

from core.models import User, UserProfile, Stock
from decimal import Decimal

print("Creating basic demo data...")

# Create test user
demo_user, created = User.objects.get_or_create(
    username="testuser",
    defaults={
        "email": "demo@boursex.fr",
        "first_name": "Alexandre",
        "last_name": "Martin"
    }
)
if created:
    demo_user.set_password("testpass123")
    demo_user.save()

# Create profile
profile, created = UserProfile.objects.get_or_create(
    user=demo_user,
    defaults={
        "balance": Decimal("25000.00"),
        "xp": 2500,
        "level": 8,
        "total_trades": 47,
        "total_profit_loss": Decimal("3247.85"),
    }
)

# Create basic stocks
stocks_data = [
    {"symbol": "AAPL", "name": "Apple Inc.", "price": 175.50},
    {"symbol": "MSFT", "name": "Microsoft Corporation", "price": 332.40},
    {"symbol": "GOOGL", "name": "Alphabet Inc.", "price": 138.75},
    {"symbol": "TSLA", "name": "Tesla Inc.", "price": 245.80},
    {"symbol": "NVDA", "name": "NVIDIA Corporation", "price": 485.20},
]

for stock_data in stocks_data:
    stock, created = Stock.objects.get_or_create(
        symbol=stock_data["symbol"],
        defaults={
            "name": stock_data["name"],
            "current_price": Decimal(str(stock_data["price"])),
            "volume": 1000000,
        }
    )
    if created:
        print(f"Created stock: {stock.symbol}")

print("Demo data setup complete!")
print(f"Test user: {demo_user.username}")
print(f"Balance: {profile.balance} MGA")
print(f"Level: {profile.level}")
print(f"Stocks created: {Stock.objects.count()}")
