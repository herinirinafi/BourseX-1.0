from rest_framework import serializers
from .models import Stock, StockPriceHistory

class StockPriceHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = StockPriceHistory
        fields = ['price', 'timestamp']

class StockSerializer(serializers.ModelSerializer):
    price_history = StockPriceHistorySerializer(many=True, read_only=True)
    
    class Meta:
        model = Stock
        fields = ['id', 'symbol', 'name', 'current_price', 'volume', 'last_updated', 'price_history']
