from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=10000.00)
    xp = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    total_profit_loss = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_trades = models.IntegerField(default=0)
    successful_trades = models.IntegerField(default=0)
    # win_rate persisted field removed; computed via serializer now
    trading_score = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    # Keep in sync with migration 0003 (max_length=6)
    risk_tolerance = models.CharField(max_length=6, choices=[
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High')
    ], default='MEDIUM')
    created_at = models.DateTimeField(auto_now_add=True)
    # last_login omitted from migrations; avoid DB drift by not persisting this for now
    # last_login = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"
    
    @property
    def badge_count(self):
        return UserBadge.objects.filter(user=self.user).count()
    
    @property
    def next_level_xp(self):
        return self.level * 100
    
    @property
    def xp_progress(self):
        """Pourcentage de progression vers le niveau suivant"""
        current_level_xp = (self.level - 1) * 100
        next_level_xp = self.level * 100
        progress_xp = self.xp - current_level_xp
        return min(100, (progress_xp / (next_level_xp - current_level_xp)) * 100)
    
    @property
    def total_profit(self):
        """Alias pour total_profit_loss pour compatibilité"""
        return self.total_profit_loss
    
    # Remarque: le taux de réussite est exposé via le Serializer (get_win_rate)
    
    def calculate_trading_score(self):
        """Calcule le score de trading basé sur plusieurs métriques"""
        base_score = 0
        
        # Points pour XP
        base_score += self.xp * 0.1
        
        # Points pour profit
        if self.total_profit_loss > 0:
            base_score += float(self.total_profit_loss) * 0.01
        
        # Points pour win rate (calculé dynamiquement)
        win_rate = 0.0
        if self.total_trades > 0:
            win_rate = (self.successful_trades / self.total_trades)
        base_score += float(win_rate) * 10
        
        # Bonus pour nombre de trades
        base_score += self.total_trades * 2
        
        # Bonus pour badges
        base_score += self.badge_count * 50
        
        self.trading_score = min(9999.99, base_score)
        return self.trading_score

class Stock(models.Model):
    symbol = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)
    current_price = models.DecimalField(max_digits=10, decimal_places=2)
    volume = models.PositiveIntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.symbol} - {self.name}"

class StockPriceHistory(models.Model):
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name='price_history')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']

class Portfolio(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=6)
    average_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'stock')
    
    def __str__(self):
        return f"{self.user.username} - {self.stock.symbol}: {self.quantity}"

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('BUY', 'Buy'),
        ('SELL', 'Sell'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    transaction_type = models.CharField(max_length=4, choices=TRANSACTION_TYPES)
    quantity = models.DecimalField(max_digits=10, decimal_places=6)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} {self.transaction_type} {self.quantity} {self.stock.symbol}"

class Mission(models.Model):
    MISSION_TYPES = [
        ('DAILY', 'Daily'),
        ('WEEKLY', 'Weekly'),
        ('ACHIEVEMENT', 'Achievement'),
    ]
    
    title = models.CharField(max_length=100)
    description = models.TextField()
    mission_type = models.CharField(max_length=11, choices=MISSION_TYPES)
    reward_xp = models.IntegerField()
    reward_money = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    requirement = models.JSONField(default=dict)  # JSON field for requirements
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.title

class UserMission(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    mission = models.ForeignKey(Mission, on_delete=models.CASCADE)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    progress = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)  # Progress percentage
    
    class Meta:
        unique_together = ('user', 'mission')
    
    def __str__(self):
        return f"{self.user.username} - {self.mission.title}"

class Watchlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'stock')
    
    def __str__(self):
        return f"{self.user.username} watching {self.stock.symbol}"

class Badge(models.Model):
    """Système de badges pour la gamification"""
    BADGE_TYPES = [
        ('ACHIEVEMENT', 'Achievement'),
        ('MILESTONE', 'Milestone'),
        ('SPECIAL', 'Special'),
        ('SEASONAL', 'Seasonal'),
    ]
    
    BADGE_TIERS = [
        ('BRONZE', 'Bronze'),
        ('SILVER', 'Silver'),
        ('GOLD', 'Gold'),
        ('PLATINUM', 'Platinum'),
        ('DIAMOND', 'Diamond'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    badge_type = models.CharField(max_length=11, choices=BADGE_TYPES)
    tier = models.CharField(max_length=8, choices=BADGE_TIERS, default='BRONZE')
    icon_url = models.URLField(blank=True, null=True)
    requirement = models.JSONField(default=dict)  # Conditions pour obtenir le badge
    xp_bonus = models.IntegerField(default=0)  # XP bonus pour obtenir ce badge
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} ({self.tier})"

class UserBadge(models.Model):
    """Badges obtenus par les utilisateurs"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'badge')
    
    def __str__(self):
        return f"{self.user.username} - {self.badge.name}"

class Leaderboard(models.Model):
    """Classement des utilisateurs"""
    LEADERBOARD_TYPES = [
        ('XP', 'Experience Points'),
        ('PROFIT', 'Total Profit'),
        ('TRADES', 'Trade Count'),
        # Keep minimal set aligned with migration to avoid schema churn
        ('WIN_RATE', 'Win Rate'),
        ('VOLUME', 'Trading Volume'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    # Align with migration 0003 (max_length=8, score max_digits=12)
    leaderboard_type = models.CharField(max_length=8, choices=LEADERBOARD_TYPES)
    score = models.DecimalField(max_digits=12, decimal_places=2)
    rank = models.IntegerField()
    period_start = models.DateTimeField()
    period_end = models.DateTimeField()
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        # Align unique constraint with migration 0003
        unique_together = ('user', 'leaderboard_type', 'period_start')
        ordering = ['rank']
    
    def __str__(self):
        return f"{self.user.username} - {self.leaderboard_type} Rank #{self.rank}"

class Achievement(models.Model):
    """Système d'achievements avancé"""
    ACHIEVEMENT_CATEGORIES = [
        ('TRADING', 'Trading'),
        ('PORTFOLIO', 'Portfolio'),
        ('SOCIAL', 'Social'),
        ('LEARNING', 'Learning'),
        ('STREAK', 'Streak'),
        ('MILESTONE', 'Milestone'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    # Align with migration 0003 (max_length=9)
    category = models.CharField(max_length=9, choices=ACHIEVEMENT_CATEGORIES)
    icon_url = models.URLField(blank=True)
    requirement = models.JSONField(default=dict)
    reward_xp = models.IntegerField()
    reward_money = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    badge = models.ForeignKey(Badge, on_delete=models.SET_NULL, null=True, blank=True)
    is_hidden = models.BooleanField(default=False)  # Achievement secret
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class UserAchievement(models.Model):
    """Achievements obtenus par les utilisateurs"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    progress = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    
    class Meta:
        unique_together = ('user', 'achievement')
    
    def __str__(self):
        return f"{self.user.username} - {self.achievement.name}"

class DailyStreak(models.Model):
    """Système de streak quotidien"""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    # Align with migration 0003 (auto_now_add=True)
    last_activity_date = models.DateField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.current_streak} days streak"

class Notification(models.Model):
    """Système de notifications gamifiées"""
    NOTIFICATION_TYPES = [
        ('BADGE', 'Badge Earned'),
        ('ACHIEVEMENT', 'Achievement Unlocked'),
        ('LEVEL_UP', 'Level Up'),
        ('MISSION', 'Mission Complete'),
        ('TRADE', 'Trade Alert'),
        ('SOCIAL', 'Social'),
        ('SYSTEM', 'System'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    # Align with migration 0003 (max_length=11 for type, title 200)
    notification_type = models.CharField(max_length=11, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"
