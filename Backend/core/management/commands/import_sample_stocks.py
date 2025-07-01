from django.core.management.base import BaseCommand
from core.models import Stock, StockPriceHistory
import random
from datetime import datetime, timedelta

class Command(BaseCommand):
    help = 'Import sample stock data for testing'

    def handle(self, *args, **options):
        # Sample stock data
        stocks_data = [
            {'symbol': 'AAPL', 'name': 'Apple Inc.'},
            {'symbol': 'GOOGL', 'name': 'Alphabet Inc.'},
            {'symbol': 'MSFT', 'name': 'Microsoft Corporation'},
            {'symbol': 'AMZN', 'name': 'Amazon.com Inc.'},
            {'symbol': 'META', 'name': 'Meta Platforms Inc.'},
        ]

        for stock_data in stocks_data:
            # Create or update stock
            stock, created = Stock.objects.update_or_create(
                symbol=stock_data['symbol'],
                defaults={
                    'name': stock_data['name'],
                    'current_price': round(random.uniform(100, 2000), 2),
                    'volume': random.randint(1000, 1000000)
                }
            )
            
            # Create price history for the last 30 days
            today = datetime.now()
            for days_ago in range(30, -1, -1):
                date = today - timedelta(days=days_ago)
                price = stock.current_price * (1 + random.uniform(-0.05, 0.05))
                StockPriceHistory.objects.create(
                    stock=stock,
                    price=round(price, 2),
                    timestamp=date
                )
            
            self.stdout.write(self.style.SUCCESS(f'Successfully created/updated {stock.symbol}'))
        
        self.stdout.write(self.style.SUCCESS('Successfully imported all sample stocks'))
