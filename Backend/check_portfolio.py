#!/usr/bin/env python
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'boursex_api.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import Portfolio, Stock

user = User.objects.get(username='testuser')
portfolio = Portfolio.objects.filter(user=user)

print('User Portfolio:')
for p in portfolio:
    print(f'  {p.stock.symbol}: {p.quantity} shares at avg price {p.average_price} MGA')
print(f'Total portfolio items: {portfolio.count()}')
