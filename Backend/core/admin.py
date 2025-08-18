from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.db import models
import json
from .models import (
    UserProfile, Stock, StockPriceHistory, Portfolio,
    Transaction, Mission, UserMission, Watchlist,
    Badge, UserBadge, Leaderboard, Achievement,
    UserAchievement, DailyStreak, Notification
)

# Enhanced User Admin with inline UserProfile
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    readonly_fields = ['trading_score', 'badge_count', 'next_level_xp', 'xp_progress', 'total_profit']

class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'profile_level', 'profile_xp', 'profile_balance')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined')
    
    def profile_level(self, obj):
        try:
            return obj.userprofile.level
        except UserProfile.DoesNotExist:
            return 'No Profile'
    profile_level.short_description = 'Level'
    
    def profile_xp(self, obj):
        try:
            return obj.userprofile.xp
        except UserProfile.DoesNotExist:
            return 'N/A'
    profile_xp.short_description = 'XP'
    
    def profile_balance(self, obj):
        try:
            return f"${obj.userprofile.balance:,.2f}"
        except UserProfile.DoesNotExist:
            return 'N/A'
    profile_balance.short_description = 'Balance'

# Re-register User admin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'level', 'xp', 'balance_formatted', 'total_trades', 'computed_win_rate', 'trading_score_formatted', 'risk_tolerance']
    list_filter = ['level', 'risk_tolerance', 'created_at']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['trading_score', 'badge_count', 'next_level_xp', 'xp_progress', 'created_at']
    fieldsets = (
        ('Basic Info', {
            'fields': ('user', 'created_at')
        }),
        ('Game Stats', {
            'fields': ('level', 'xp', 'next_level_xp', 'xp_progress', 'trading_score')
        }),
        ('Financial Data', {
            'fields': ('balance', 'total_profit_loss', 'risk_tolerance')
        }),
        ('Trading Performance', {
            'fields': ('total_trades', 'successful_trades', 'badge_count')
        }),
    )
    actions = ['reset_balance', 'level_up_users', 'add_xp']

    def balance_formatted(self, obj):
        return format_html('<span style="color: green; font-weight: bold;">${:,.2f}</span>', obj.balance)
    balance_formatted.short_description = 'Balance'

    def trading_score_formatted(self, obj):
        color = 'green' if obj.trading_score > 100 else 'orange' if obj.trading_score > 50 else 'red'
        return format_html('<span style="color: {}; font-weight: bold;">{:.2f}</span>', color, obj.trading_score)
    trading_score_formatted.short_description = 'Trading Score'

    def computed_win_rate(self, obj):
        if obj.total_trades == 0:
            return format_html('<span style="color: gray;">0%</span>')
        rate = round((obj.successful_trades / obj.total_trades) * 100, 2)
        color = 'green' if rate >= 70 else 'orange' if rate >= 50 else 'red'
        return format_html('<span style="color: {}; font-weight: bold;">{}%</span>', color, rate)
    computed_win_rate.short_description = 'Win Rate'

    def reset_balance(self, request, queryset):
        queryset.update(balance=10000.00)
        self.message_user(request, f"{queryset.count()} user balances reset to $10,000.")
    reset_balance.short_description = "Reset balance to $10,000"

    def level_up_users(self, request, queryset):
        for profile in queryset:
            profile.level += 1
            profile.save()
        self.message_user(request, f"{queryset.count()} users leveled up.")
    level_up_users.short_description = "Level up selected users"

    def add_xp(self, request, queryset):
        queryset.update(xp=models.F('xp') + 100)
        self.message_user(request, f"Added 100 XP to {queryset.count()} users.")
    add_xp.short_description = "Add 100 XP"

@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ('symbol', 'name', 'current_price_formatted', 'volume_formatted', 'price_change', 'last_updated')
    search_fields = ('symbol', 'name')
    list_filter = ('last_updated',)
    ordering = ('symbol',)
    actions = ['update_prices', 'simulate_price_change']
    readonly_fields = ['last_updated']
    
    def current_price_formatted(self, obj):
        return format_html('<span style="color: blue; font-weight: bold;">${:.2f}</span>', obj.current_price)
    current_price_formatted.short_description = 'Current Price'
    
    def volume_formatted(self, obj):
        return f"{obj.volume:,}"
    volume_formatted.short_description = 'Volume'
    
    def price_change(self, obj):
        # Get the latest price history
        latest = obj.price_history.first()
        if latest and obj.price_history.count() > 1:
            previous = obj.price_history.all()[1]
            change = latest.price - previous.price
            percentage = (change / previous.price) * 100
            color = 'green' if change >= 0 else 'red'
            return format_html(
                '<span style="color: {};">{:.2f} ({:.2f}%)</span>',
                color, change, percentage
            )
        return '-'
    price_change.short_description = 'Price Change'
    
    def update_prices(self, request, queryset):
        # Simulate price updates
        import random
        for stock in queryset:
            change_percent = random.uniform(-0.05, 0.05)  # ±5% change
            new_price = stock.current_price * (1 + change_percent)
            stock.current_price = round(new_price, 2)
            stock.save()
        self.message_user(request, f"Updated prices for {queryset.count()} stocks.")
    update_prices.short_description = "Simulate price updates"

@admin.register(StockPriceHistory)
class StockPriceHistoryAdmin(admin.ModelAdmin):
    list_display = ('stock', 'price', 'timestamp')
    list_filter = ('stock', 'timestamp')
    search_fields = ('stock__symbol', 'stock__name')
    ordering = ('-timestamp',)

@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    list_display = ['user', 'stock', 'quantity', 'average_price', 'created_at']
    list_filter = ['stock', 'created_at']
    search_fields = ['user__username', 'stock__symbol']

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'stock', 'transaction_type', 'quantity', 'price', 'total_amount', 'timestamp']
    list_filter = ['transaction_type', 'stock', 'timestamp']
    search_fields = ['user__username', 'stock__symbol']
    date_hierarchy = 'timestamp'

@admin.register(Mission)
class MissionAdmin(admin.ModelAdmin):
    list_display = ['title', 'mission_type', 'reward_xp', 'reward_money', 'is_active']
    list_filter = ['mission_type', 'is_active']
    search_fields = ['title', 'description']

@admin.register(UserMission)
class UserMissionAdmin(admin.ModelAdmin):
    list_display = ['user', 'mission', 'is_completed', 'progress', 'completed_at']
    list_filter = ['is_completed', 'mission__mission_type', 'completed_at']
    search_fields = ['user__username', 'mission__title']

@admin.register(Watchlist)
class WatchlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'stock', 'added_at']
    list_filter = ['stock', 'added_at']
    search_fields = ['user__username', 'stock__symbol']

# Administration de la Gamification

@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ['name', 'badge_type', 'tier', 'xp_bonus', 'is_active']
    list_filter = ['badge_type', 'tier', 'is_active']
    search_fields = ['name', 'description']
    ordering = ['tier', 'badge_type', 'name']

@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ['user', 'badge', 'earned_at']
    list_filter = ['badge__tier', 'badge__badge_type', 'earned_at']
    search_fields = ['user__username', 'badge__name']
    date_hierarchy = 'earned_at'

@admin.register(Leaderboard)
class LeaderboardAdmin(admin.ModelAdmin):
    list_display = ['user', 'leaderboard_type', 'rank', 'score', 'updated_at']
    list_filter = ['leaderboard_type', 'period_start', 'updated_at']
    search_fields = ['user__username']
    ordering = ['leaderboard_type', 'rank']

@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'reward_xp', 'reward_money', 'is_hidden', 'is_active']
    list_filter = ['category', 'is_hidden', 'is_active']
    search_fields = ['name', 'description']
    ordering = ['category', 'name']

@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ['user', 'achievement', 'progress', 'earned_at']
    list_filter = ['achievement__category', 'earned_at']
    search_fields = ['user__username', 'achievement__name']
    date_hierarchy = 'earned_at'

@admin.register(DailyStreak)
class DailyStreakAdmin(admin.ModelAdmin):
    list_display = ['user', 'current_streak', 'longest_streak', 'last_activity_date']
    list_filter = ['last_activity_date']
    search_fields = ['user__username']
    ordering = ['-current_streak']

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'notification_type', 'title', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['user__username', 'title', 'message']
    date_hierarchy = 'created_at'
    actions = ['mark_as_read', 'mark_as_unread']
    
    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)
        self.message_user(request, f"{queryset.count()} notifications marquées comme lues.")
    mark_as_read.short_description = "Marquer comme lu"
    
    def mark_as_unread(self, request, queryset):
        queryset.update(is_read=False)
        self.message_user(request, f"{queryset.count()} notifications marquées comme non lues.")
    mark_as_unread.short_description = "Marquer comme non lu"
