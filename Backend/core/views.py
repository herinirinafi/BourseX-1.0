from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from django.db.models import Sum, Count, Avg, Q
from datetime import datetime, timedelta
import random
from decimal import Decimal

# Import du moteur de gamification
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from gamification_engine import GamificationEngine, process_post_transaction_gamification

from .models import (
    UserProfile, Stock, StockPriceHistory, Portfolio, 
    Transaction, Mission, UserMission, Watchlist,
    Badge, UserBadge, Leaderboard, Achievement,
    UserAchievement, DailyStreak, Notification
)
from .serializers import (
    UserProfileSerializer, StockSerializer, StockPriceHistorySerializer,
    PortfolioSerializer, TransactionSerializer, MissionSerializer, 
    UserMissionSerializer, WatchlistSerializer, TradeSerializer,
    BadgeSerializer, UserBadgeSerializer, LeaderboardSerializer,
    AchievementSerializer, UserAchievementSerializer, DailyStreakSerializer,
    NotificationSerializer, GamificationSummarySerializer, LeaderboardSummarySerializer
)

class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        stock = self.get_object()
        history = stock.price_history.all()[:100]
        serializer = StockPriceHistorySerializer(history, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def update_prices(self, request):
        """Simulate real-time price updates"""
        stocks = Stock.objects.all()
        for stock in stocks:
            change = random.uniform(-0.05, 0.05)
            new_price = float(stock.current_price) * (1 + change)
            stock.current_price = max(Decimal('0.01'), Decimal(str(new_price)))
            stock.save()
            
            StockPriceHistory.objects.create(
                stock=stock,
                price=stock.current_price
            )
        
        serializer = self.get_serializer(stocks, many=True)
        return Response(serializer.data)

class PortfolioViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PortfolioSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Portfolio.objects.filter(user=self.request.user)

class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).order_by('-timestamp')

@api_view(['POST'])
def execute_trade(request):
    """Execute buy/sell trades"""
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    serializer = TradeSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    stock = get_object_or_404(Stock, id=data['stock_id'])
    quantity = data['quantity']
    trade_type = data['trade_type']
    
    user_profile, created = UserProfile.objects.get_or_create(user=request.user)
    
    with transaction.atomic():
        if trade_type == 'BUY':
            total_cost = quantity * stock.current_price
            if user_profile.balance < total_cost:
                return Response({'error': 'Insufficient balance'}, status=status.HTTP_400_BAD_REQUEST)
            
            user_profile.balance -= total_cost
            user_profile.save()
            
            portfolio_item, created = Portfolio.objects.get_or_create(
                user=request.user,
                stock=stock,
                defaults={'quantity': Decimal('0'), 'average_price': stock.current_price}
            )
            
            if not created:
                total_quantity = portfolio_item.quantity + quantity
                total_cost_all = (portfolio_item.quantity * portfolio_item.average_price) + total_cost
                portfolio_item.average_price = total_cost_all / total_quantity
                portfolio_item.quantity = total_quantity
            else:
                portfolio_item.quantity = quantity
                portfolio_item.average_price = stock.current_price
            
            portfolio_item.save()
            
        elif trade_type == 'SELL':
            portfolio_item = Portfolio.objects.filter(user=request.user, stock=stock).first()
            if not portfolio_item or portfolio_item.quantity < quantity:
                return Response({'error': 'Insufficient stock quantity'}, status=status.HTTP_400_BAD_REQUEST)
            
            total_revenue = quantity * stock.current_price
            user_profile.balance += total_revenue
            user_profile.save()
            
            portfolio_item.quantity -= quantity
            if portfolio_item.quantity == 0:
                portfolio_item.delete()
            else:
                portfolio_item.save()
        
        # Créer la transaction
        trade_transaction = Transaction.objects.create(
            user=request.user,
            stock=stock,
            transaction_type=trade_type,
            quantity=quantity,
            price=stock.current_price,
            total_amount=quantity * stock.current_price
        )
        
        # Mettre à jour les statistiques du profil
        user_profile.total_trades += 1
        
        # Calculer profit/perte pour les ventes
        if trade_type == 'SELL':
            profit_loss = (stock.current_price - portfolio_item.average_price) * quantity
            user_profile.total_profit_loss += profit_loss
            if profit_loss > 0:
                user_profile.successful_trades += 1
        
        user_profile.xp += 10
        
        # Calculer le nouveau niveau
        new_level = (user_profile.xp // 100) + 1
        if new_level > user_profile.level:
            user_profile.level = new_level
        
        user_profile.save()
        
        # 🎮 TRAITEMENT DE LA GAMIFICATION
        try:
            gamification_result = process_post_transaction_gamification(request.user)
            gamification_info = {
                'badges_awarded': gamification_result.get('badges_awarded', 0),
                'achievements_awarded': gamification_result.get('achievements_awarded', 0),
                'level_up': gamification_result.get('level_up', False),
                'new_level': gamification_result.get('new_level', user_profile.level)
            }
        except Exception as e:
            # En cas d'erreur de gamification, on continue sans faire échouer le trade
            print(f"Erreur gamification: {e}")
            gamification_info = {
                'badges_awarded': 0,
                'achievements_awarded': 0,
                'level_up': False,
                'new_level': user_profile.level
            }
    
    response_data = {
        'message': f'Successfully {trade_type.lower()}ed {quantity} shares of {stock.symbol}',
        'new_balance': user_profile.balance,
        'xp_gained': 10,
        'gamification': gamification_info
    }
    
    # Ajouter des informations de profit pour les ventes
    if trade_type == 'SELL':
        response_data['profit_loss'] = profit_loss
        response_data['total_profit'] = user_profile.total_profit_loss
    
    return Response(response_data)

class MissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Mission.objects.filter(is_active=True)
    serializer_class = MissionSerializer

class UserMissionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserMissionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserMission.objects.filter(user=self.request.user)

class WatchlistViewSet(viewsets.ModelViewSet):
    serializer_class = WatchlistSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Watchlist.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@api_view(['GET'])
def dashboard_data(request):
    """Get dashboard summary data"""
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    user_profile, created = UserProfile.objects.get_or_create(user=request.user)
    portfolio_items = Portfolio.objects.filter(user=request.user)
    total_portfolio_value = sum(item.quantity * item.stock.current_price for item in portfolio_items)
    
    recent_transactions = Transaction.objects.filter(user=request.user).order_by('-timestamp')[:5]
    user_missions = UserMission.objects.filter(user=request.user, is_completed=False)[:3]
    
    return Response({
        'user_profile': UserProfileSerializer(user_profile).data,
        'portfolio_value': total_portfolio_value,
        'recent_transactions': TransactionSerializer(recent_transactions, many=True).data,
        'active_missions': UserMissionSerializer(user_missions, many=True).data,
        'top_stocks': StockSerializer(Stock.objects.all()[:5], many=True).data
    })

# Nouvelles vues pour la gamification avancée

class BadgeViewSet(viewsets.ReadOnlyModelViewSet):
    """Gestion des badges"""
    queryset = Badge.objects.filter(is_active=True)
    serializer_class = BadgeSerializer
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_badges(self, request):
        """Badges de l'utilisateur connecté"""
        user_badges = UserBadge.objects.filter(user=request.user).select_related('badge')
        serializer = UserBadgeSerializer(user_badges, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        """Badges disponibles à obtenir"""
        all_badges = Badge.objects.filter(is_active=True)
        if request.user.is_authenticated:
            earned_badge_ids = UserBadge.objects.filter(user=request.user).values_list('badge_id', flat=True)
            available_badges = all_badges.exclude(id__in=earned_badge_ids)
        else:
            available_badges = all_badges
        
        serializer = self.get_serializer(available_badges, many=True)
        return Response(serializer.data)

class LeaderboardViewSet(viewsets.ReadOnlyModelViewSet):
    """Gestion des classements"""
    serializer_class = LeaderboardSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        leaderboard_type = self.request.query_params.get('type', 'XP')
        return Leaderboard.objects.filter(leaderboard_type=leaderboard_type).order_by('rank')[:50]
    
    @action(detail=False, methods=['get'])
    def all_leaderboards(self, request):
        """Tous les classements avec résumé"""
        today = timezone.now().date()
        week_start = today - timedelta(days=today.weekday())
        
        # Classement XP
        xp_leaderboard = Leaderboard.objects.filter(
            leaderboard_type='XP',
            period_start__date=week_start
        ).order_by('rank')[:10]
        
        # Classement Profit
        profit_leaderboard = Leaderboard.objects.filter(
            leaderboard_type='PROFIT',
            period_start__date=week_start
        ).order_by('rank')[:10]
        
        # Classement Trades
        trades_leaderboard = Leaderboard.objects.filter(
            leaderboard_type='TRADES',
            period_start__date=week_start
        ).order_by('rank')[:10]
        
        # Classement Portfolio
        portfolio_leaderboard = Leaderboard.objects.filter(
            leaderboard_type='PORTFOLIO_VALUE',
            period_start__date=week_start
        ).order_by('rank')[:10]
        
        # Rang de l'utilisateur
        user_ranks = {}
        for lb_type in ['XP', 'PROFIT', 'TRADES', 'PORTFOLIO_VALUE']:
            user_entry = Leaderboard.objects.filter(
                user=request.user,
                leaderboard_type=lb_type,
                period_start__date=week_start
            ).first()
            user_ranks[lb_type.lower()] = user_entry.rank if user_entry else None
        
        return Response({
            'xp_leaderboard': LeaderboardSerializer(xp_leaderboard, many=True).data,
            'profit_leaderboard': LeaderboardSerializer(profit_leaderboard, many=True).data,
            'trades_leaderboard': LeaderboardSerializer(trades_leaderboard, many=True).data,
            'portfolio_leaderboard': LeaderboardSerializer(portfolio_leaderboard, many=True).data,
            'user_rank_summary': user_ranks
        })
    
    @action(detail=False, methods=['post'])
    def update_leaderboards(self, request):
        """Mettre à jour tous les classements"""
        self.update_all_leaderboards()
        return Response({'message': 'Leaderboards updated successfully'})
    
    def update_all_leaderboards(self):
        """Fonction pour mettre à jour tous les classements"""
        today = timezone.now().date()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        
        # Supprimer les anciens classements de la semaine
        Leaderboard.objects.filter(
            period_start__date=week_start,
            period_end__date=week_end
        ).delete()
        
        # Classement XP
        xp_rankings = UserProfile.objects.filter(user__is_active=True).order_by('-xp')
        for rank, profile in enumerate(xp_rankings, 1):
            Leaderboard.objects.create(
                user=profile.user,
                leaderboard_type='XP',
                score=profile.xp,
                rank=rank,
                period_start=timezone.make_aware(datetime.combine(week_start, datetime.min.time())),
                period_end=timezone.make_aware(datetime.combine(week_end, datetime.max.time()))
            )
        
        # Classement Profit
        profit_rankings = UserProfile.objects.filter(user__is_active=True).order_by('-total_profit')
        for rank, profile in enumerate(profit_rankings, 1):
            Leaderboard.objects.create(
                user=profile.user,
                leaderboard_type='PROFIT',
                score=profile.total_profit,
                rank=rank,
                period_start=timezone.make_aware(datetime.combine(week_start, datetime.min.time())),
                period_end=timezone.make_aware(datetime.combine(week_end, datetime.max.time()))
            )
        
        # Classement Trades
        trade_rankings = UserProfile.objects.filter(user__is_active=True).order_by('-total_trades')
        for rank, profile in enumerate(trade_rankings, 1):
            Leaderboard.objects.create(
                user=profile.user,
                leaderboard_type='TRADES',
                score=profile.total_trades,
                rank=rank,
                period_start=timezone.make_aware(datetime.combine(week_start, datetime.min.time())),
                period_end=timezone.make_aware(datetime.combine(week_end, datetime.max.time()))
            )

class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
    """Gestion des achievements"""
    serializer_class = AchievementSerializer
    
    def get_queryset(self):
        queryset = Achievement.objects.filter(is_active=True)
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(is_hidden=False)
        return queryset
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_achievements(self, request):
        """Achievements de l'utilisateur"""
        user_achievements = UserAchievement.objects.filter(user=request.user).select_related('achievement')
        serializer = UserAchievementSerializer(user_achievements, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def check_progress(self, request):
        """Vérifier et mettre à jour les achievements"""
        completed_achievements = self.check_user_achievements(request.user)
        return Response({
            'completed_achievements': completed_achievements,
            'message': f'{len(completed_achievements)} nouveaux achievements débloqués!'
        })
    
    def check_user_achievements(self, user):
        """Vérifier les achievements d'un utilisateur"""
        completed = []
        user_profile = UserProfile.objects.get(user=user)
        
        # Achievement: Premier Trade
        if user_profile.total_trades >= 1:
            achievement, created = UserAchievement.objects.get_or_create(
                user=user,
                achievement=Achievement.objects.get_or_create(
                    name="Premier Trade",
                    defaults={
                        'description': "Effectuez votre premier trade",
                        'category': 'TRADING',
                        'reward_xp': 50,
                        'reward_money': Decimal('100.00')
                    }
                )[0]
            )
            if created:
                completed.append("Premier Trade")
        
        # Achievement: Trader Expérimenté
        if user_profile.total_trades >= 50:
            achievement, created = UserAchievement.objects.get_or_create(
                user=user,
                achievement=Achievement.objects.get_or_create(
                    name="Trader Expérimenté",
                    defaults={
                        'description': "Effectuez 50 trades",
                        'category': 'TRADING',
                        'reward_xp': 200,
                        'reward_money': Decimal('500.00')
                    }
                )[0]
            )
            if created:
                completed.append("Trader Expérimenté")
        
        # Achievement: Millionnaire
        if user_profile.total_profit >= 1000000:
            achievement, created = UserAchievement.objects.get_or_create(
                user=user,
                achievement=Achievement.objects.get_or_create(
                    name="Millionnaire",
                    defaults={
                        'description': "Réalisez 1 million de profit",
                        'category': 'MILESTONE',
                        'reward_xp': 1000,
                        'reward_money': Decimal('10000.00')
                    }
                )[0]
            )
            if created:
                completed.append("Millionnaire")
        
        return completed

class NotificationViewSet(viewsets.ModelViewSet):
    """Gestion des notifications"""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Marquer toutes les notifications comme lues"""
        count = Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'message': f'{count} notifications marquées comme lues'})
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Marquer une notification comme lue"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'message': 'Notification marquée comme lue'})

@api_view(['GET'])
def gamification_summary(request):
    """Résumé complet de gamification pour un utilisateur"""
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    user_profile, created = UserProfile.objects.get_or_create(user=request.user)
    
    # Badges de l'utilisateur
    user_badges = UserBadge.objects.filter(user=request.user).select_related('badge')
    
    # Achievements de l'utilisateur
    user_achievements = UserAchievement.objects.filter(user=request.user).select_related('achievement')
    
    # Streak quotidien
    daily_streak, created = DailyStreak.objects.get_or_create(user=request.user)
    
    # Notifications récentes
    recent_notifications = Notification.objects.filter(user=request.user, is_read=False)[:5]
    
    # Rangs dans les leaderboards
    today = timezone.now().date()
    week_start = today - timedelta(days=today.weekday())
    
    leaderboard_ranks = {}
    for lb_type in ['XP', 'PROFIT', 'TRADES', 'PORTFOLIO_VALUE']:
        user_entry = Leaderboard.objects.filter(
            user=request.user,
            leaderboard_type=lb_type,
            period_start__date=week_start
        ).first()
        leaderboard_ranks[lb_type.lower()] = user_entry.rank if user_entry else None
    
    # Statistiques de la semaine
    week_transactions = Transaction.objects.filter(
        user=request.user,
        timestamp__date__gte=week_start
    )
    
    weekly_stats = {
        'trades_count': week_transactions.count(),
        'weekly_profit': week_transactions.aggregate(
            total=Sum('total_amount')
        )['total'] or 0,
        'xp_gained': user_achievements.filter(
            earned_at__date__gte=week_start
        ).aggregate(total=Sum('achievement__reward_xp'))['total'] or 0
    }
    
    return Response({
        'user_profile': UserProfileSerializer(user_profile).data,
        'badges': UserBadgeSerializer(user_badges, many=True).data,
        'achievements': UserAchievementSerializer(user_achievements, many=True).data,
        'daily_streak': DailyStreakSerializer(daily_streak).data,
        'leaderboard_ranks': leaderboard_ranks,
        'recent_notifications': NotificationSerializer(recent_notifications, many=True).data,
        'progress_to_next_level': user_profile.xp_progress,
        'weekly_stats': weekly_stats
    })

@api_view(['POST'])
def update_gamification(request):
    """Forcer la mise à jour de la gamification pour un utilisateur"""
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        from .gamification_engine import GamificationEngine
        engine = GamificationEngine()
        engine.check_all_rules(request.user)
        
        return Response({
            'message': 'Gamification mise à jour avec succès',
            'timestamp': timezone.now()
        })
    except Exception as e:
        return Response({
            'error': f'Erreur lors de la mise à jour: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def user_badges(request):
    """Récupérer les badges de l'utilisateur"""
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    user_badges = UserBadge.objects.filter(user=request.user).select_related('badge')
    return Response({
        'count': user_badges.count(),
        'results': UserBadgeSerializer(user_badges, many=True).data
    })

@api_view(['GET'])
def user_achievements(request):
    """Récupérer les achievements de l'utilisateur"""
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    user_achievements = UserAchievement.objects.filter(user=request.user).select_related('achievement')
    return Response({
        'count': user_achievements.count(),
        'results': UserAchievementSerializer(user_achievements, many=True).data
    })

@api_view(['GET', 'POST'])
def daily_streak(request):
    """Récupérer ou mettre à jour le streak quotidien"""
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    streak, created = DailyStreak.objects.get_or_create(user=request.user)
    
    if request.method == 'POST':
        # Mettre à jour le streak
        today = timezone.now().date()
        if streak.last_activity_date != today:
            if streak.last_activity_date == today - timedelta(days=1):
                # Continuité du streak
                streak.current_streak += 1
            else:
                # Rupture du streak
                streak.current_streak = 1
            
            streak.last_activity_date = today
            if streak.current_streak > streak.longest_streak:
                streak.longest_streak = streak.current_streak
            streak.save()
    
    return Response(DailyStreakSerializer(streak).data)
