from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from datetime import timedelta
from .models import *
from .serializers import *
import random
from decimal import Decimal

class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

class AdminUserViewSet(viewsets.ModelViewSet):
    """
    Admin ViewSet for managing users with full CRUD operations
    """
    queryset = User.objects.all().select_related('userprofile')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['is_active', 'is_staff']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['username', 'date_joined']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UserCreateUpdateSerializer
        return UserDetailSerializer
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get comprehensive user statistics"""
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        staff_users = User.objects.filter(is_staff=True).count()
        
        # Recent activity
        last_week = timezone.now() - timedelta(days=7)
        new_users_week = User.objects.filter(date_joined__gte=last_week).count()
        
        # Profile stats
        profiles = UserProfile.objects.all()
        avg_level = profiles.aggregate(avg_level=Avg('level'))['avg_level'] or 0
        avg_balance = profiles.aggregate(avg_balance=Avg('balance'))['avg_balance'] or 0
        total_balance = profiles.aggregate(total_balance=Sum('balance'))['total_balance'] or 0
        
        return Response({
            'total_users': total_users,
            'active_users': active_users,
            'staff_users': staff_users,
            'new_users_week': new_users_week,
            'avg_level': round(avg_level, 2),
            'avg_balance': float(avg_balance),
            'total_balance': float(total_balance),
        })
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle user active status"""
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        return Response({
            'message': f'User {user.username} {"activated" if user.is_active else "deactivated"}',
            'is_active': user.is_active
        })
    
    @action(detail=True, methods=['post'])
    def toggle_staff(self, request, pk=None):
        """Toggle user staff status"""
        user = self.get_object()
        user.is_staff = not user.is_staff
        user.save()
        return Response({
            'message': f'User {user.username} {"promoted to" if user.is_staff else "demoted from"} staff',
            'is_staff': user.is_staff
        })
    
    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        """Reset user password"""
        user = self.get_object()
        new_password = request.data.get('password', 'password123')
        user.set_password(new_password)
        user.save()
        return Response({'message': f'Password reset for {user.username}'})

class AdminStockViewSet(viewsets.ModelViewSet):
    """
    Admin ViewSet for managing stocks with full CRUD operations
    """
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    permission_classes = [IsAdminUser]
    search_fields = ['symbol', 'name', 'sector']
    ordering_fields = ['symbol', 'current_price', 'market_cap']
    
    @action(detail=False, methods=['post'])
    def bulk_update_prices(self, request):
        """Update all stock prices with random fluctuations"""
        stocks = Stock.objects.all()
        updated_count = 0
        
        for stock in stocks:
            # Random price change between -5% and +5%
            change_percent = random.uniform(-0.05, 0.05)
            new_price = float(stock.current_price) * (1 + change_percent)
            stock.current_price = max(Decimal('0.01'), Decimal(str(round(new_price, 2))))
            stock.save()
            
            # Create price history entry
            StockPriceHistory.objects.create(
                stock=stock,
                price=stock.current_price
            )
            updated_count += 1
        
        return Response({
            'message': f'Updated {updated_count} stock prices',
            'updated_count': updated_count
        })
    
    @action(detail=True, methods=['get'])
    def price_history(self, request, pk=None):
        """Get stock price history"""
        stock = self.get_object()
        history = stock.price_history.all().order_by('-timestamp')[:100]
        return Response(StockPriceHistorySerializer(history, many=True).data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get stock market statistics"""
        total_stocks = Stock.objects.count()
        total_market_cap = Stock.objects.aggregate(total_cap=Sum('market_cap'))['total_cap'] or 0
        avg_price = Stock.objects.aggregate(avg_price=Avg('current_price'))['avg_price'] or 0
        
        # Top performers
        top_gainers = Stock.objects.order_by('-current_price')[:5]
        
        return Response({
            'total_stocks': total_stocks,
            'total_market_cap': float(total_market_cap),
            'avg_price': float(avg_price),
            'top_stocks': StockSerializer(top_gainers, many=True).data
        })

class AdminTransactionViewSet(viewsets.ModelViewSet):
    """
    Admin ViewSet for managing transactions
    """
    queryset = Transaction.objects.all().select_related('user', 'stock')
    serializer_class = TransactionSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['transaction_type', 'user', 'stock']
    search_fields = ['user__username', 'stock__symbol']
    ordering_fields = ['timestamp', 'amount', 'price']
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get transaction statistics"""
        total_transactions = Transaction.objects.count()
        total_volume = Transaction.objects.aggregate(
            total_volume=Sum('quantity')
        )['total_volume'] or 0
        
        # Recent activity
        last_24h = timezone.now() - timedelta(hours=24)
        recent_transactions = Transaction.objects.filter(timestamp__gte=last_24h).count()
        
        # Buy vs Sell ratio
        buy_count = Transaction.objects.filter(transaction_type='buy').count()
        sell_count = Transaction.objects.filter(transaction_type='sell').count()
        
        return Response({
            'total_transactions': total_transactions,
            'total_volume': total_volume,
            'recent_transactions': recent_transactions,
            'buy_transactions': buy_count,
            'sell_transactions': sell_count,
        })

class AdminMissionViewSet(viewsets.ModelViewSet):
    """
    Admin ViewSet for managing missions
    """
    queryset = Mission.objects.all()
    serializer_class = MissionSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['is_active', 'difficulty']
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'xp_reward', 'created_at']
    
    @action(detail=False, methods=['post'])
    def create_daily_missions(self, request):
        """Create daily missions for all users"""
        missions = Mission.objects.filter(is_active=True)
        users = User.objects.filter(is_active=True)
        created_count = 0
        
        for user in users:
            for mission in missions.order_by('?')[:3]:  # Random 3 missions per user
                user_mission, created = UserMission.objects.get_or_create(
                    user=user,
                    mission=mission,
                    defaults={
                        'assigned_date': timezone.now().date(),
                        'is_completed': False,
                        'progress': 0
                    }
                )
                if created:
                    created_count += 1
        
        return Response({
            'message': f'Created {created_count} daily missions',
            'created_count': created_count
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get mission statistics"""
        total_missions = Mission.objects.count()
        active_missions = Mission.objects.filter(is_active=True).count()
        total_user_missions = UserMission.objects.count()
        completed_missions = UserMission.objects.filter(is_completed=True).count()
        
        completion_rate = (completed_missions / total_user_missions * 100) if total_user_missions > 0 else 0
        
        return Response({
            'total_missions': total_missions,
            'active_missions': active_missions,
            'total_user_missions': total_user_missions,
            'completed_missions': completed_missions,
            'completion_rate': round(completion_rate, 2)
        })

class AdminBadgeViewSet(viewsets.ModelViewSet):
    """
    Admin ViewSet for managing badges
    """
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
    permission_classes = [IsAdminUser]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get badge statistics"""
        total_badges = Badge.objects.count()
        total_user_badges = UserBadge.objects.count()
        
        # Most earned badges
        popular_badges = Badge.objects.annotate(
            earned_count=Count('userbadge')
        ).order_by('-earned_count')[:5]
        
        # Recent badge earnings
        last_week = timezone.now() - timedelta(days=7)
        recent_badges = UserBadge.objects.filter(earned_date__gte=last_week).count()
        
        return Response({
            'total_badges': total_badges,
            'total_user_badges': total_user_badges,
            'recent_badges': recent_badges,
            'popular_badges': BadgeSerializer(popular_badges, many=True).data
        })

class AdminNotificationViewSet(viewsets.ModelViewSet):
    """
    Admin ViewSet for managing notifications
    """
    queryset = Notification.objects.all().select_related('user')
    serializer_class = NotificationSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['notification_type', 'is_read']
    search_fields = ['title', 'message', 'user__username']
    ordering_fields = ['created_at', 'notification_type']
    
    @action(detail=False, methods=['post'])
    def broadcast(self, request):
        """Send notification to all users"""
        title = request.data.get('title')
        message = request.data.get('message')
        notification_type = request.data.get('type', 'info')
        
        if not title or not message:
            return Response(
                {'error': 'Title and message are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        users = User.objects.filter(is_active=True)
        notifications = []
        
        for user in users:
            notifications.append(Notification(
                user=user,
                title=title,
                message=message,
                notification_type=notification_type
            ))
        
        Notification.objects.bulk_create(notifications)
        
        return Response({
            'message': f'Broadcast sent to {len(notifications)} users',
            'sent_count': len(notifications)
        })

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard_stats(request):
    """Get comprehensive admin dashboard statistics"""
    # User stats
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    staff_users = User.objects.filter(is_staff=True).count()
    
    # Recent activity
    last_week = timezone.now() - timedelta(days=7)
    new_users_week = User.objects.filter(date_joined__gte=last_week).count()
    
    # Profile stats
    profiles = UserProfile.objects.all()
    avg_level = profiles.aggregate(avg_level=Avg('level'))['avg_level'] or 0
    avg_balance = profiles.aggregate(avg_balance=Avg('balance'))['avg_balance'] or 0
    total_balance = profiles.aggregate(total_balance=Sum('balance'))['total_balance'] or 0
    
    # Stock stats
    total_stocks = Stock.objects.count()
    total_transactions = Transaction.objects.count()
    recent_transactions = Transaction.objects.filter(timestamp__gte=last_week).count()
    
    # Mission stats
    total_missions = Mission.objects.count()
    active_missions = Mission.objects.filter(is_active=True).count()
    
    return Response({
        'users': {
            'total': total_users,
            'active': active_users,
            'staff': staff_users,
            'new_this_week': new_users_week,
            'avg_level': round(avg_level, 2),
            'avg_balance': float(avg_balance),
            'total_balance': float(total_balance)
        },
        'trading': {
            'total_stocks': total_stocks,
            'total_transactions': total_transactions,
            'recent_transactions': recent_transactions
        },
        'gamification': {
            'total_missions': total_missions,
            'active_missions': active_missions
        }
    })

@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_bulk_actions(request):
    """Handle bulk admin actions"""
    action = request.data.get('action')
    user_ids = request.data.get('user_ids', [])
    
    if not action or not user_ids:
        return Response(
            {'error': 'Action and user_ids are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    users = User.objects.filter(id__in=user_ids)
    
    if action == 'activate':
        users.update(is_active=True)
        message = f'Activated {users.count()} users'
    elif action == 'deactivate':
        users.update(is_active=False)
        message = f'Deactivated {users.count()} users'
    elif action == 'promote':
        users.update(is_staff=True)
        message = f'Promoted {users.count()} users to staff'
    elif action == 'demote':
        users.update(is_staff=False)
        message = f'Demoted {users.count()} users from staff'
    else:
        return Response(
            {'error': 'Invalid action'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    return Response({'message': message})

@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_market_simulation(request):
    """Simulate market events"""
    event_type = request.data.get('type', 'random_fluctuation')
    intensity = float(request.data.get('intensity', 0.1))  # 10% by default
    
    stocks = Stock.objects.all()
    updated_count = 0
    
    for stock in stocks:
        if event_type == 'bull_market':
            # Positive market movement
            change = random.uniform(0, intensity)
        elif event_type == 'bear_market':
            # Negative market movement
            change = random.uniform(-intensity, 0)
        else:
            # Random fluctuation
            change = random.uniform(-intensity, intensity)
        
        new_price = float(stock.current_price) * (1 + change)
        stock.current_price = max(Decimal('0.01'), Decimal(str(round(new_price, 2))))
        stock.save()
        
        # Create price history
        StockPriceHistory.objects.create(
            stock=stock,
            price=stock.current_price
        )
        updated_count += 1
    
    return Response({
        'message': f'Market simulation completed: {event_type}',
        'updated_stocks': updated_count,
        'intensity': intensity
    })

@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_assign_badge(request):
    """Assign badge to users"""
    badge_id = request.data.get('badge_id')
    user_ids = request.data.get('user_ids', [])
    
    if not badge_id or not user_ids:
        return Response(
            {'error': 'Badge ID and user IDs are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        badge = Badge.objects.get(id=badge_id)
        users = User.objects.filter(id__in=user_ids)
        
        assigned_count = 0
        for user in users:
            user_badge, created = UserBadge.objects.get_or_create(
                user=user,
                badge=badge,
                defaults={'earned_date': timezone.now()}
            )
            if created:
                assigned_count += 1
        
        return Response({
            'message': f'Assigned badge "{badge.name}" to {assigned_count} users',
            'assigned_count': assigned_count
        })
    
    except Badge.DoesNotExist:
        return Response(
            {'error': 'Badge not found'},
            status=status.HTTP_404_NOT_FOUND
        )
        """Set specific price for a stock"""
        stock = self.get_object()
        new_price = Decimal(str(request.data.get('price')))
        
        stock.current_price = new_price
        stock.save()
        
        # Create price history entry
        StockPriceHistory.objects.create(
            stock=stock,
            price=new_price
        )
        
        return Response({
            'message': f'Set {stock.symbol} price to ${new_price}',
            'new_price': float(new_price)
        })

class AdminTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Admin ViewSet for viewing transactions (read-only)
    """
    queryset = Transaction.objects.all().select_related('user', 'stock')
    serializer_class = TransactionSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['transaction_type', 'user', 'stock']
    search_fields = ['user__username', 'stock__symbol']
    ordering_fields = ['timestamp', 'total_amount']
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get transaction statistics"""
        total_transactions = Transaction.objects.count()
        total_volume = Transaction.objects.aggregate(total=Sum('total_amount'))['total'] or 0
        buy_transactions = Transaction.objects.filter(transaction_type='BUY').count()
        sell_transactions = Transaction.objects.filter(transaction_type='SELL').count()
        
        # Recent activity (last 24 hours)
        recent_transactions = Transaction.objects.filter(
            timestamp__gte=timezone.now() - timedelta(hours=24)
        ).count()
        
        return Response({
            'total_transactions': total_transactions,
            'total_volume': float(total_volume),
            'buy_transactions': buy_transactions,
            'sell_transactions': sell_transactions,
            'recent_transactions': recent_transactions,
        })

class AdminMissionViewSet(viewsets.ModelViewSet):
    """
    Admin ViewSet for managing missions
    """
    queryset = Mission.objects.all()
    serializer_class = MissionSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['mission_type', 'is_active']
    search_fields = ['title', 'description']
    
    @action(detail=True, methods=['post'])
    def assign_to_users(self, request, pk=None):
        """Assign mission to specific users"""
        mission = self.get_object()
        user_ids = request.data.get('user_ids', [])
        
        created_count = 0
        for user_id in user_ids:
            try:
                user = User.objects.get(id=user_id)
                user_mission, created = UserMission.objects.get_or_create(
                    user=user,
                    mission=mission
                )
                if created:
                    created_count += 1
            except User.DoesNotExist:
                continue
                
        return Response({
            'message': f'Assigned mission to {created_count} users',
            'created_count': created_count
        })
    
    @action(detail=False, methods=['post'])
    def create_daily_missions(self, request):
        """Create daily missions for all users"""
        active_missions = Mission.objects.filter(
            mission_type='DAILY',
            is_active=True
        )
        
        users = User.objects.filter(is_active=True)
        created_count = 0
        
        for user in users:
            for mission in active_missions:
                user_mission, created = UserMission.objects.get_or_create(
                    user=user,
                    mission=mission,
                    defaults={'progress': 0.0}
                )
                if created:
                    created_count += 1
                    
        return Response({
            'message': f'Created {created_count} daily mission assignments',
            'created_count': created_count
        })

class AdminBadgeViewSet(viewsets.ModelViewSet):
    """
    Admin ViewSet for managing badges
    """
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['badge_type', 'tier', 'is_active']
    search_fields = ['name', 'description']
    
    @action(detail=True, methods=['post'])
    def award_to_users(self, request, pk=None):
        """Award badge to specific users"""
        badge = self.get_object()
        user_ids = request.data.get('user_ids', [])
        
        awarded_count = 0
        for user_id in user_ids:
            try:
                user = User.objects.get(id=user_id)
                user_badge, created = UserBadge.objects.get_or_create(
                    user=user,
                    badge=badge
                )
                if created:
                    # Add XP bonus
                    profile = user.userprofile
                    profile.xp += badge.xp_bonus
                    profile.save()
                    awarded_count += 1
            except User.DoesNotExist:
                continue
                
        return Response({
            'message': f'Awarded badge to {awarded_count} users',
            'awarded_count': awarded_count
        })

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard_stats(request):
    """
    Get comprehensive dashboard statistics for admin
    """
    # User stats
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    new_users_week = User.objects.filter(
        date_joined__gte=timezone.now() - timedelta(days=7)
    ).count()
    
    # Trading stats
    total_transactions = Transaction.objects.count()
    total_volume = Transaction.objects.aggregate(total=Sum('total_amount'))['total'] or 0
    avg_balance = UserProfile.objects.aggregate(avg=Avg('balance'))['avg'] or 0
    
    # Gamification stats
    total_badges = Badge.objects.count()
    total_missions = Mission.objects.count()
    active_missions = Mission.objects.filter(is_active=True).count()
    
    # Recent activity
    recent_transactions = Transaction.objects.filter(
        timestamp__gte=timezone.now() - timedelta(hours=24)
    ).count()
    
    recent_badges = UserBadge.objects.filter(
        earned_at__gte=timezone.now() - timedelta(hours=24)
    ).count()
    
    # Top performers
    top_traders = UserProfile.objects.order_by('-trading_score')[:5]
    top_levels = UserProfile.objects.order_by('-level', '-xp')[:5]
    
    return Response({
        'user_stats': {
            'total_users': total_users,
            'active_users': active_users,
            'new_users_week': new_users_week,
            'avg_balance': float(avg_balance)
        },
        'trading_stats': {
            'total_transactions': total_transactions,
            'total_volume': float(total_volume),
            'recent_transactions': recent_transactions
        },
        'gamification_stats': {
            'total_badges': total_badges,
            'total_missions': total_missions,
            'active_missions': active_missions,
            'recent_badges': recent_badges
        },
        'top_performers': {
            'top_traders': [
                {
                    'username': profile.user.username,
                    'trading_score': float(profile.trading_score),
                    'level': profile.level
                } for profile in top_traders
            ],
            'top_levels': [
                {
                    'username': profile.user.username,
                    'level': profile.level,
                    'xp': profile.xp
                } for profile in top_levels
            ]
        }
    })

@api_view(['POST'])
@permission_classes([IsAdminUser])
def bulk_user_operations(request):
    """
    Perform bulk operations on users
    """
    operation = request.data.get('operation')
    user_ids = request.data.get('user_ids', [])
    
    if not operation or not user_ids:
        return Response({'error': 'Operation and user_ids required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    users = User.objects.filter(id__in=user_ids)
    affected_count = 0
    
    if operation == 'activate':
        users.update(is_active=True)
        affected_count = users.count()
        
    elif operation == 'deactivate':
        users.update(is_active=False)
        affected_count = users.count()
        
    elif operation == 'reset_balance':
        UserProfile.objects.filter(user__in=users).update(balance=10000.00)
        affected_count = users.count()
        
    elif operation == 'add_xp':
        xp_amount = request.data.get('amount', 100)
        profiles = UserProfile.objects.filter(user__in=users)
        for profile in profiles:
            profile.xp += xp_amount
            profile.save()
        affected_count = profiles.count()
        
    else:
        return Response({'error': 'Invalid operation'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'message': f'Successfully performed {operation} on {affected_count} users',
        'affected_count': affected_count
    })
