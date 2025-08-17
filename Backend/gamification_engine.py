"""
Système de règles métier pour l'attribution automatique des badges et achievements
"""

import os
import django
from decimal import Decimal
from datetime import datetime, timedelta
from django.utils import timezone

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'boursex_api.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import (
    UserProfile, Badge, UserBadge, Achievement, UserAchievement,
    Transaction, Portfolio, DailyStreak, Notification
)

class GamificationEngine:
    """Moteur de gamification pour attribution automatique"""
    
    def __init__(self):
        self.rules = []
        self._initialize_rules()
    
    def _initialize_rules(self):
        """Initialise toutes les règles d'attribution"""
        
        # Règles pour les badges de trading
        self.rules.extend([
            {
                'type': 'badge',
                'name': 'Premier Pas',
                'condition': lambda user: self._check_first_trade(user),
                'description': 'Premier trade effectué'
            },
            {
                'type': 'badge', 
                'name': 'Trader Novice',
                'condition': lambda user: self._check_trade_count(user, 10),
                'description': '10 trades effectués'
            },
            {
                'type': 'badge',
                'name': 'Trader Expérimenté', 
                'condition': lambda user: self._check_trade_count(user, 50),
                'description': '50 trades effectués'
            },
            {
                'type': 'badge',
                'name': 'Maître Trader',
                'condition': lambda user: self._check_trade_count(user, 200),
                'description': '200 trades effectués'
            },
            {
                'type': 'badge',
                'name': 'Légende du Trading',
                'condition': lambda user: self._check_trade_count(user, 1000),
                'description': '1000 trades effectués'
            },
        ])
        
        # Règles pour les badges de profit
        self.rules.extend([
            {
                'type': 'badge',
                'name': 'Premier Profit',
                'condition': lambda user: self._check_first_profit(user),
                'description': 'Premier profit réalisé'
            },
            {
                'type': 'badge',
                'name': 'Profitable',
                'condition': lambda user: self._check_total_profit(user, 1000),
                'description': '1000$ de profit total'
            },
            {
                'type': 'badge',
                'name': 'Millionnaire',
                'condition': lambda user: self._check_total_profit(user, 1000000),
                'description': '1 million de profit total'
            },
        ])
        
        # Règles pour les badges de streak
        self.rules.extend([
            {
                'type': 'badge',
                'name': 'Habitué',
                'condition': lambda user: self._check_daily_streak(user, 7),
                'description': '7 jours consécutifs'
            },
            {
                'type': 'badge',
                'name': 'Fidèle',
                'condition': lambda user: self._check_daily_streak(user, 30),
                'description': '30 jours consécutifs'
            },
            {
                'type': 'badge',
                'name': 'Dévoué',
                'condition': lambda user: self._check_daily_streak(user, 100),
                'description': '100 jours consécutifs'
            },
        ])
        
        # Règles pour les achievements
        self.rules.extend([
            {
                'type': 'achievement',
                'name': 'Premier Trade',
                'condition': lambda user: self._check_first_trade(user),
                'description': 'Premier trade effectué'
            },
            {
                'type': 'achievement',
                'name': 'Trader Actif',
                'condition': lambda user: self._check_trade_count(user, 25),
                'description': '25 trades effectués'
            },
            {
                'type': 'achievement',
                'name': 'Machine à Trader',
                'condition': lambda user: self._check_trade_count(user, 100),
                'description': '100 trades effectués'
            },
            {
                'type': 'achievement',
                'name': 'Premier Investissement',
                'condition': lambda user: self._check_first_portfolio(user),
                'description': 'Premier stock en portefeuille'
            },
            {
                'type': 'achievement',
                'name': 'Portfolio Équilibré',
                'condition': lambda user: self._check_portfolio_diversity(user, 5),
                'description': '5 stocks différents en portefeuille'
            },
        ])
    
    # Méthodes de vérification des conditions
    
    def _check_first_trade(self, user):
        """Vérifie si l'utilisateur a effectué son premier trade"""
        return Transaction.objects.filter(user=user).exists()
    
    def _check_trade_count(self, user, target_count):
        """Vérifie si l'utilisateur a effectué X trades"""
        profile = self._get_profile(user)
        return profile.total_trades >= target_count
    
    def _check_first_profit(self, user):
        """Vérifie si l'utilisateur a réalisé son premier profit"""
        profile = self._get_profile(user)
        return profile.total_profit_loss > 0
    
    def _check_total_profit(self, user, target_profit):
        """Vérifie si l'utilisateur a atteint X profit total"""
        profile = self._get_profile(user)
        return profile.total_profit_loss >= target_profit
    
    def _check_daily_streak(self, user, target_streak):
        """Vérifie si l'utilisateur a un streak de X jours"""
        try:
            streak = DailyStreak.objects.get(user=user)
            return streak.current_streak >= target_streak
        except DailyStreak.DoesNotExist:
            return False
    
    def _check_first_portfolio(self, user):
        """Vérifie si l'utilisateur a des stocks en portefeuille"""
        return Portfolio.objects.filter(user=user, quantity__gt=0).exists()
    
    def _check_portfolio_diversity(self, user, target_count):
        """Vérifie si l'utilisateur a X stocks différents"""
        return Portfolio.objects.filter(user=user, quantity__gt=0).count() >= target_count
    
    def _get_profile(self, user):
        """Récupère ou crée le profil utilisateur"""
        profile, created = UserProfile.objects.get_or_create(user=user)
        return profile
    
    # Méthodes d'attribution
    
    def check_and_award_badges(self, user):
        """Vérifie et attribue les badges pour un utilisateur"""
        awarded_badges = []
        
        for rule in self.rules:
            if rule['type'] == 'badge':
                if rule['condition'](user):
                    badge = self._award_badge(user, rule['name'])
                    if badge:
                        awarded_badges.append(badge)
        
        return awarded_badges
    
    def check_and_award_achievements(self, user):
        """Vérifie et attribue les achievements pour un utilisateur"""
        awarded_achievements = []
        
        for rule in self.rules:
            if rule['type'] == 'achievement':
                if rule['condition'](user):
                    achievement = self._award_achievement(user, rule['name'])
                    if achievement:
                        awarded_achievements.append(achievement)
        
        return awarded_achievements
    
    def _award_badge(self, user, badge_name):
        """Attribue un badge à un utilisateur"""
        try:
            badge = Badge.objects.get(name=badge_name)
            user_badge, created = UserBadge.objects.get_or_create(
                user=user,
                badge=badge
            )
            if created:
                # Créer une notification
                self._create_notification(
                    user, 
                    'BADGE', 
                    f'Badge Obtenu!',
                    f'Félicitations! Vous avez obtenu le badge "{badge.name}"',
                    {'badge_id': badge.id, 'xp_bonus': badge.xp_bonus}
                )
                
                # Ajouter l'XP bonus
                profile = self._get_profile(user)
                profile.xp += badge.xp_bonus
                profile.save()
                
                return user_badge
        except Badge.DoesNotExist:
            pass
        return None
    
    def _award_achievement(self, user, achievement_name):
        """Attribue un achievement à un utilisateur"""
        try:
            achievement = Achievement.objects.get(name=achievement_name)
            user_achievement, created = UserAchievement.objects.get_or_create(
                user=user,
                achievement=achievement,
                defaults={'progress': 100.00, 'earned_at': timezone.now()}
            )
            if created:
                # Créer une notification
                self._create_notification(
                    user,
                    'ACHIEVEMENT',
                    f'Achievement Débloqué!',
                    f'Félicitations! Vous avez débloqué "{achievement.name}"',
                    {'achievement_id': achievement.id, 'xp_reward': achievement.reward_xp, 'money_reward': achievement.reward_money}
                )
                
                # Ajouter les récompenses
                profile = self._get_profile(user)
                profile.xp += achievement.reward_xp
                profile.balance += achievement.reward_money
                profile.save()
                
                return user_achievement
        except Achievement.DoesNotExist:
            pass
        return None
    
    def _create_notification(self, user, notification_type, title, message, data=None):
        """Crée une notification pour l'utilisateur"""
        Notification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            data=data or {}
        )
    
    def process_user_gamification(self, user):
        """Traite la gamification complète pour un utilisateur"""
        awarded_badges = self.check_and_award_badges(user)
        awarded_achievements = self.check_and_award_achievements(user)
        
        # Vérifier le level up
        profile = self._get_profile(user)
        old_level = profile.level
        new_level = self._calculate_level_from_xp(profile.xp)
        
        if new_level > old_level:
            profile.level = new_level
            profile.save()
            
            self._create_notification(
                user,
                'LEVEL_UP',
                f'Niveau {new_level} Atteint!',
                f'Félicitations! Vous êtes maintenant niveau {new_level}!',
                {'old_level': old_level, 'new_level': new_level}
            )
        
        return {
            'badges_awarded': len(awarded_badges),
            'achievements_awarded': len(awarded_achievements),
            'level_up': new_level > old_level,
            'new_level': new_level
        }
    
    def _calculate_level_from_xp(self, xp):
        """Calcule le niveau basé sur l'XP"""
        # Formule: niveau = floor(xp / 100) + 1
        return min(100, max(1, (xp // 100) + 1))
    
    def update_daily_streak(self, user):
        """Met à jour le streak quotidien de l'utilisateur"""
        today = timezone.now().date()
        streak, created = DailyStreak.objects.get_or_create(user=user)
        
        # Si c'est un nouveau streak ou si l'utilisateur n'était pas connecté hier
        if created or streak.last_activity_date < today - timedelta(days=1):
            if created or streak.last_activity_date == today - timedelta(days=1):
                # Continue le streak
                streak.current_streak += 1
            else:
                # Reset le streak
                streak.current_streak = 1
        
        # Mettre à jour le record
        if streak.current_streak > streak.longest_streak:
            streak.longest_streak = streak.current_streak
        
        streak.last_activity_date = today
        streak.save()
        
        return streak

# Fonction utilitaire pour traitement en lot
def process_all_users_gamification():
    """Traite la gamification pour tous les utilisateurs"""
    engine = GamificationEngine()
    results = []
    
    for user in User.objects.all():
        try:
            result = engine.process_user_gamification(user)
            result['user'] = user.username
            results.append(result)
        except Exception as e:
            print(f"Erreur pour l'utilisateur {user.username}: {e}")
    
    return results

# Fonction à appeler après chaque transaction
def process_post_transaction_gamification(user):
    """Traite la gamification après une transaction"""
    engine = GamificationEngine()
    
    # Mettre à jour le streak
    engine.update_daily_streak(user)
    
    # Traiter la gamification
    return engine.process_user_gamification(user)

if __name__ == '__main__':
    # Test du système
    print("🎮 Test du Moteur de Gamification")
    print("=" * 50)
    
    # Traiter un utilisateur de test
    try:
        test_user = User.objects.get(username='testuser')
        engine = GamificationEngine()
        result = engine.process_user_gamification(test_user)
        
        print(f"✅ Utilisateur: {test_user.username}")
        print(f"🏆 Badges attribués: {result['badges_awarded']}")
        print(f"🎯 Achievements attribués: {result['achievements_awarded']}")
        print(f"📈 Level up: {'Oui' if result['level_up'] else 'Non'}")
        print(f"🎖️ Niveau actuel: {result['new_level']}")
        
    except User.DoesNotExist:
        print("❌ Utilisateur de test non trouvé")
