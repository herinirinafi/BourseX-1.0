from django.contrib import admin
from .models import (
    UserProfile, Stock, StockPriceHistory, Portfolio,
    Transaction, Mission, UserMission, Watchlist,
    Badge, UserBadge, Leaderboard, Achievement,
    UserAchievement, DailyStreak, Notification
)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'level', 'xp', 'balance', 'total_trades', 'computed_win_rate', 'trading_score']
    list_filter = ['level', 'risk_tolerance', 'created_at']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['trading_score', 'badge_count', 'next_level_xp', 'xp_progress']

    def computed_win_rate(self, obj):
        if obj.total_trades == 0:
            return "0%"
        rate = round((obj.successful_trades / obj.total_trades) * 100, 2)
        return f"{rate}%"
    computed_win_rate.short_description = 'Win Rate'

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
