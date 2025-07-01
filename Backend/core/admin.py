from django.contrib import admin
from .models import Stock, StockPriceHistory

@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ('symbol', 'name', 'current_price', 'volume', 'last_updated')
    search_fields = ('symbol', 'name')
    list_filter = ('last_updated',)
    ordering = ('symbol',)

@admin.register(StockPriceHistory)
class StockPriceHistoryAdmin(admin.ModelAdmin):
    list_display = ('stock', 'price', 'timestamp')
    list_filter = ('stock', 'timestamp')
    search_fields = ('stock__symbol', 'stock__name')
    ordering = ('-timestamp',)
