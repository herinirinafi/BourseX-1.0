from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    UserProfile, Stock, StockPriceHistory, Portfolio, 
    Transaction, Mission, UserMission, Watchlist,
    Badge, UserBadge, Leaderboard, Achievement, 
    UserAchievement, DailyStreak, Notification
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class UserDetailSerializer(serializers.ModelSerializer):
    userprofile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'is_staff', 'date_joined', 'userprofile']
    
    def get_userprofile(self, obj):
        try:
            profile = obj.userprofile
            return {
                'balance': float(profile.balance),
                'level': profile.level,
                'xp': profile.xp,
                'total_trades': profile.total_trades,
                'successful_trades': profile.successful_trades,
                'trading_score': profile.trading_score
            }
        except:
            return None

class UserCreateUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'is_active', 'is_staff', 'password']
    
    def create(self, validated_data):
        password = validated_data.pop('password', 'password123')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    badge_count = serializers.ReadOnlyField()
    next_level_xp = serializers.ReadOnlyField()
    xp_progress = serializers.ReadOnlyField()
    win_rate = serializers.SerializerMethodField()
    total_profit = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = [
            'user', 'balance', 'xp', 'level', 'total_profit', 'total_trades',
            'successful_trades', 'win_rate', 'trading_score',
            'risk_tolerance', 'created_at', 'badge_count',
            'next_level_xp', 'xp_progress'
        ]
    
    def get_win_rate(self, obj):
        """Calcule le taux de réussite"""
        if obj.total_trades == 0:
            return 0.0
        return round((obj.successful_trades / obj.total_trades) * 100, 2)
    
    def get_total_profit(self, obj):
        """Retourne le profit total"""
        return obj.total_profit_loss

class StockPriceHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = StockPriceHistory
        fields = ['price', 'timestamp']

class StockSerializer(serializers.ModelSerializer):
    price_history = StockPriceHistorySerializer(many=True, read_only=True)
    
    class Meta:
        model = Stock
        fields = ['id', 'symbol', 'name', 'current_price', 'volume', 'last_updated', 'price_history']

class PortfolioSerializer(serializers.ModelSerializer):
    stock = StockSerializer(read_only=True)
    current_value = serializers.SerializerMethodField()
    profit_loss = serializers.SerializerMethodField()
    
    class Meta:
        model = Portfolio
        fields = ['id', 'stock', 'quantity', 'average_price', 'current_value', 'profit_loss', 'created_at']
    
    def get_current_value(self, obj):
        try:
            return float(obj.quantity) * float(obj.stock.current_price)
        except Exception:
            return 0.0
    
    def get_profit_loss(self, obj):
        try:
            return (float(obj.stock.current_price) - float(obj.average_price)) * float(obj.quantity)
        except Exception:
            return 0.0

class TransactionSerializer(serializers.ModelSerializer):
    stock = StockSerializer(read_only=True)
    
    class Meta:
        model = Transaction
        fields = ['id', 'stock', 'transaction_type', 'quantity', 'price', 'total_amount', 'timestamp']

class MissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mission
        fields = ['id', 'title', 'description', 'mission_type', 'reward_xp', 'reward_money', 'requirement', 'is_active']

class UserMissionSerializer(serializers.ModelSerializer):
    mission = MissionSerializer(read_only=True)
    
    class Meta:
        model = UserMission
        fields = ['id', 'mission', 'is_completed', 'completed_at', 'progress']

class WatchlistSerializer(serializers.ModelSerializer):
    stock = StockSerializer(read_only=True)
    
    class Meta:
        model = Watchlist
        fields = ['id', 'stock', 'added_at']

class TradeSerializer(serializers.Serializer):
    stock_id = serializers.IntegerField(required=False)
    symbol = serializers.CharField(required=False, allow_blank=False)
    quantity = serializers.DecimalField(max_digits=10, decimal_places=6)
    trade_type = serializers.ChoiceField(choices=['BUY', 'SELL'])

    def validate(self, attrs):
        stock_id = attrs.get('stock_id')
        symbol = attrs.get('symbol')
        if stock_id is None and not symbol:
            raise serializers.ValidationError('Either stock_id or symbol is required')
        return attrs

# Nouveaux sérialiseurs pour la gamification avancée

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'name', 'description', 'badge_type', 'tier', 'icon_url', 'xp_bonus']

class UserBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)
    
    class Meta:
        model = UserBadge
        fields = ['id', 'badge', 'earned_at']

class LeaderboardSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_profile = serializers.SerializerMethodField()
    
    class Meta:
        model = Leaderboard
        fields = ['user', 'user_profile', 'leaderboard_type', 'score', 'rank', 'updated_at']
    
    def get_user_profile(self, obj):
        try:
            profile = UserProfile.objects.get(user=obj.user)
            return {
                'level': profile.level,
                'badge_count': profile.badge_count,
                'trading_score': profile.trading_score
            }
        except UserProfile.DoesNotExist:
            return None

class AchievementSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)
    
    class Meta:
        model = Achievement
        fields = ['id', 'name', 'description', 'category', 'reward_xp', 'reward_money', 'badge', 'is_hidden']

class UserAchievementSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer(read_only=True)
    
    class Meta:
        model = UserAchievement
        fields = ['id', 'achievement', 'earned_at', 'progress']

class DailyStreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyStreak
        fields = ['current_streak', 'longest_streak', 'last_activity_date']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'notification_type', 'title', 'message', 'is_read', 'data', 'created_at']

class GamificationSummarySerializer(serializers.Serializer):
    """Sérialiseur pour le résumé complet de gamification"""
    user_profile = UserProfileSerializer()
    badges = UserBadgeSerializer(many=True)
    achievements = UserAchievementSerializer(many=True)
    daily_streak = DailyStreakSerializer()
    leaderboard_ranks = serializers.DictField()
    recent_notifications = NotificationSerializer(many=True)
    progress_to_next_level = serializers.DecimalField(max_digits=5, decimal_places=2)
    weekly_stats = serializers.DictField()
    
class LeaderboardSummarySerializer(serializers.Serializer):
    """Sérialiseur pour tous les leaderboards"""
    xp_leaderboard = LeaderboardSerializer(many=True)
    profit_leaderboard = LeaderboardSerializer(many=True)
    trades_leaderboard = LeaderboardSerializer(many=True)
    portfolio_leaderboard = LeaderboardSerializer(many=True)
    user_rank_summary = serializers.DictField()
