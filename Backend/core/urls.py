from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views, admin_views

router = DefaultRouter()
router.register(r'user-profile', views.UserProfileViewSet, basename='user-profile')
router.register(r'stocks', views.StockViewSet)
router.register(r'portfolio', views.PortfolioViewSet, basename='portfolio')
router.register(r'transactions', views.TransactionViewSet, basename='transactions')
router.register(r'missions', views.MissionViewSet)
router.register(r'user-missions', views.UserMissionViewSet, basename='user-missions')
router.register(r'watchlist', views.WatchlistViewSet, basename='watchlist')

# Nouvelles routes pour la gamification
router.register(r'badges', views.BadgeViewSet, basename='badges')
router.register(r'leaderboard', views.LeaderboardViewSet, basename='leaderboard')
router.register(r'achievements', views.AchievementViewSet, basename='achievements')
router.register(r'notifications', views.NotificationViewSet, basename='notifications')

# Admin routes
admin_router = DefaultRouter()
admin_router.register(r'users', admin_views.AdminUserViewSet, basename='admin-users')
admin_router.register(r'stocks', admin_views.AdminStockViewSet, basename='admin-stocks')
admin_router.register(r'transactions', admin_views.AdminTransactionViewSet, basename='admin-transactions')
admin_router.register(r'missions', admin_views.AdminMissionViewSet, basename='admin-missions')
admin_router.register(r'badges', admin_views.AdminBadgeViewSet, basename='admin-badges')
admin_router.register(r'notifications', admin_views.AdminNotificationViewSet, basename='admin-notifications')

urlpatterns = [
    path('', include(router.urls)),
    path('admin/', include(admin_router.urls)),
    path('admin/dashboard-stats/', admin_views.admin_dashboard_stats, name='admin-dashboard-stats'),
    path('admin/bulk-actions/', admin_views.admin_bulk_actions, name='admin-bulk-actions'),
    path('admin/market-simulation/', admin_views.admin_market_simulation, name='admin-market-simulation'),
    path('admin/assign-badge/', admin_views.admin_assign_badge, name='admin-assign-badge'),
    path('trade/', views.execute_trade, name='execute-trade'),
    path('me/', views.me, name='me'),
    path('current-user/', views.current_user, name='current-user'),
    path('dashboard/', views.dashboard_data, name='dashboard-data'),
    path('gamification/', views.gamification_summary, name='gamification-summary'),
    path('gamification/update/', views.update_gamification, name='update-gamification'),
    path('user-badges/', views.user_badges, name='user-badges'),
    path('user-achievements/', views.user_achievements, name='user-achievements'),
    path('daily-streak/', views.daily_streak, name='daily-streak'),
]
