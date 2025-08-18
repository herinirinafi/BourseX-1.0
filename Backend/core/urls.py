from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

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

urlpatterns = [
    path('', include(router.urls)),
    path('trade/', views.execute_trade, name='execute-trade'),
    path('me/', views.me, name='me'),
    path('dashboard/', views.dashboard_data, name='dashboard-data'),
    path('gamification/', views.gamification_summary, name='gamification-summary'),
    path('gamification/update/', views.update_gamification, name='update-gamification'),
    path('user-badges/', views.user_badges, name='user-badges'),
    path('user-achievements/', views.user_achievements, name='user-achievements'),
    path('daily-streak/', views.daily_streak, name='daily-streak'),
]
