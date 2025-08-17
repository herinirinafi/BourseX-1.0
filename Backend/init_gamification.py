#!/usr/bin/env python
"""
Script d'initialisation des données de gamification pour BourseX
Ce script crée les badges, achievements et données de base pour la gamification
"""

import os
import sys
import django
from decimal import Decimal

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'boursex_api.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import (
    Badge, Achievement, Mission, UserProfile,
    Notification, DailyStreak
)

def create_badges():
    """Créer les badges de base"""
    print("🏆 Création des badges...")
    
    badges_data = [
        # Badges Trading
        {
            'name': 'Premier Pas',
            'description': 'Effectuez votre premier trade',
            'badge_type': 'ACHIEVEMENT',
            'tier': 'BRONZE',
            'xp_bonus': 25,
            'requirement': {'type': 'first_trade', 'target': 1}
        },
        {
            'name': 'Trader Novice',
            'description': 'Effectuez 10 trades',
            'badge_type': 'ACHIEVEMENT',
            'tier': 'BRONZE',
            'xp_bonus': 50,
            'requirement': {'type': 'trade_count', 'target': 10}
        },
        {
            'name': 'Trader Expérimenté',
            'description': 'Effectuez 50 trades',
            'badge_type': 'ACHIEVEMENT',
            'tier': 'SILVER',
            'xp_bonus': 100,
            'requirement': {'type': 'trade_count', 'target': 50}
        },
        {
            'name': 'Maître Trader',
            'description': 'Effectuez 200 trades',
            'badge_type': 'ACHIEVEMENT',
            'tier': 'GOLD',
            'xp_bonus': 250,
            'requirement': {'type': 'trade_count', 'target': 200}
        },
        {
            'name': 'Légende du Trading',
            'description': 'Effectuez 1000 trades',
            'badge_type': 'ACHIEVEMENT',
            'tier': 'DIAMOND',
            'xp_bonus': 500,
            'requirement': {'type': 'trade_count', 'target': 1000}
        },
        
        # Badges Profit
        {
            'name': 'Premier Profit',
            'description': 'Réalisez votre premier profit',
            'badge_type': 'ACHIEVEMENT',
            'tier': 'BRONZE',
            'xp_bonus': 30,
            'requirement': {'type': 'first_profit', 'target': 1}
        },
        {
            'name': 'Profitable',
            'description': 'Réalisez 1000$ de profit total',
            'badge_type': 'MILESTONE',
            'tier': 'SILVER',
            'xp_bonus': 100,
            'requirement': {'type': 'total_profit', 'target': 1000}
        },
        {
            'name': 'Millionnaire',
            'description': 'Réalisez 1 million de profit total',
            'badge_type': 'MILESTONE',
            'tier': 'DIAMOND',
            'xp_bonus': 1000,
            'requirement': {'type': 'total_profit', 'target': 1000000}
        },
        
        # Badges Streak
        {
            'name': 'Habitué',
            'description': 'Connectez-vous 7 jours consécutifs',
            'badge_type': 'ACHIEVEMENT',
            'tier': 'BRONZE',
            'xp_bonus': 75,
            'requirement': {'type': 'daily_streak', 'target': 7}
        },
        {
            'name': 'Fidèle',
            'description': 'Connectez-vous 30 jours consécutifs',
            'badge_type': 'ACHIEVEMENT',
            'tier': 'GOLD',
            'xp_bonus': 200,
            'requirement': {'type': 'daily_streak', 'target': 30}
        },
        
        # Badges Portfolio
        {
            'name': 'Diversifié',
            'description': 'Possédez 5 cryptomonnaies différentes',
            'badge_type': 'ACHIEVEMENT',
            'tier': 'SILVER',
            'xp_bonus': 150,
            'requirement': {'type': 'portfolio_diversity', 'target': 5}
        },
        {
            'name': 'Collectionneur',
            'description': 'Possédez 10 cryptomonnaies différentes',
            'badge_type': 'ACHIEVEMENT',
            'tier': 'GOLD',
            'xp_bonus': 300,
            'requirement': {'type': 'portfolio_diversity', 'target': 10}
        },
        
        # Badges Spéciaux
        {
            'name': 'Chanceux',
            'description': 'Réalisez un profit de 50% sur un trade',
            'badge_type': 'SPECIAL',
            'tier': 'GOLD',
            'xp_bonus': 200,
            'requirement': {'type': 'trade_profit_percent', 'target': 50}
        },
        {
            'name': 'Risque-Tout',
            'description': 'Investissez plus de 80% de votre solde en une fois',
            'badge_type': 'SPECIAL',
            'tier': 'PLATINUM',
            'xp_bonus': 400,
            'requirement': {'type': 'high_risk_trade', 'target': 80}
        },
        
        # Badges de Niveau
        {
            'name': 'Apprenti',
            'description': 'Atteignez le niveau 5',
            'badge_type': 'MILESTONE',
            'tier': 'BRONZE',
            'xp_bonus': 50,
            'requirement': {'type': 'level', 'target': 5}
        },
        {
            'name': 'Expert',
            'description': 'Atteignez le niveau 20',
            'badge_type': 'MILESTONE',
            'tier': 'GOLD',
            'xp_bonus': 300,
            'requirement': {'type': 'level', 'target': 20}
        },
        {
            'name': 'Maître',
            'description': 'Atteignez le niveau 50',
            'badge_type': 'MILESTONE',
            'tier': 'DIAMOND',
            'xp_bonus': 1000,
            'requirement': {'type': 'level', 'target': 50}
        }
    ]
    
    created_count = 0
    for badge_data in badges_data:
        badge, created = Badge.objects.get_or_create(
            name=badge_data['name'],
            tier=badge_data['tier'],
            defaults={
                'description': badge_data['description'],
                'badge_type': badge_data['badge_type'],
                'tier': badge_data['tier'],
                'icon_url': '',  # URL d'icône vide par défaut
                'requirement': badge_data['requirement'],
                'xp_bonus': badge_data['xp_bonus'],
                'is_active': True
            }
        )
        if created:
            created_count += 1
    
    print(f"✅ {created_count} badges créés")
    return created_count

def create_achievements():
    """Créer les achievements de base"""
    print("🎯 Création des achievements...")
    
    achievements_data = [
        # Achievements Trading
        {
            'name': 'Premier Trade',
            'description': 'Effectuez votre premier trade sur BourseX',
            'category': 'TRADING',
            'reward_xp': 50,
            'reward_money': Decimal('100.00'),
            'requirement': {'type': 'trade_count', 'target': 1}
        },
        {
            'name': 'Trader Actif',
            'description': 'Effectuez 25 trades',
            'category': 'TRADING',
            'reward_xp': 150,
            'reward_money': Decimal('500.00'),
            'requirement': {'type': 'trade_count', 'target': 25}
        },
        {
            'name': 'Machine à Trader',
            'description': 'Effectuez 100 trades',
            'category': 'TRADING',
            'reward_xp': 500,
            'reward_money': Decimal('2000.00'),
            'requirement': {'type': 'trade_count', 'target': 100}
        },
        
        # Achievements Portfolio
        {
            'name': 'Premier Investissement',
            'description': 'Achetez votre première cryptomonnaie',
            'category': 'PORTFOLIO',
            'reward_xp': 25,
            'reward_money': Decimal('50.00'),
            'requirement': {'type': 'first_buy', 'target': 1}
        },
        {
            'name': 'Portfolio Équilibré',
            'description': 'Possédez au moins 3 cryptomonnaies',
            'category': 'PORTFOLIO',
            'reward_xp': 100,
            'reward_money': Decimal('200.00'),
            'requirement': {'type': 'portfolio_diversity', 'target': 3}
        },
        {
            'name': 'Crypto Collector',
            'description': 'Possédez toutes les cryptomonnaies disponibles',
            'category': 'PORTFOLIO',
            'reward_xp': 1000,
            'reward_money': Decimal('5000.00'),
            'requirement': {'type': 'collect_all_crypto', 'target': 1}
        },
        
        # Achievements Streaks
        {
            'name': 'Première Semaine',
            'description': 'Connectez-vous 7 jours consécutifs',
            'category': 'STREAK',
            'reward_xp': 100,
            'reward_money': Decimal('300.00'),
            'requirement': {'type': 'daily_streak', 'target': 7}
        },
        {
            'name': 'Mois Complet',
            'description': 'Connectez-vous 30 jours consécutifs',
            'category': 'STREAK',
            'reward_xp': 500,
            'reward_money': Decimal('1500.00'),
            'requirement': {'type': 'daily_streak', 'target': 30}
        },
        
        # Achievements Sociaux
        {
            'name': 'Nouveau Membre',
            'description': 'Complétez votre profil utilisateur',
            'category': 'SOCIAL',
            'reward_xp': 25,
            'reward_money': Decimal('100.00'),
            'requirement': {'type': 'complete_profile', 'target': 1}
        },
        {
            'name': 'Explorateur',
            'description': 'Visitez tous les écrans de l\'application',
            'category': 'LEARNING',
            'reward_xp': 75,
            'reward_money': Decimal('150.00'),
            'requirement': {'type': 'visit_all_screens', 'target': 1}
        },
        
        # Achievements Milestones
        {
            'name': 'Premiers Bénéfices',
            'description': 'Réalisez 100$ de profit total',
            'category': 'MILESTONE',
            'reward_xp': 100,
            'reward_money': Decimal('250.00'),
            'requirement': {'type': 'total_profit', 'target': 100}
        },
        {
            'name': 'Investisseur Profitable',
            'description': 'Réalisez 10,000$ de profit total',
            'category': 'MILESTONE',
            'reward_xp': 750,
            'reward_money': Decimal('5000.00'),
            'requirement': {'type': 'total_profit', 'target': 10000}
        },
        {
            'name': 'Crypto Millionnaire',
            'description': 'Atteignez 1 million de profit total',
            'category': 'MILESTONE',
            'reward_xp': 2000,
            'reward_money': Decimal('50000.00'),
            'requirement': {'type': 'total_profit', 'target': 1000000},
            'is_hidden': True  # Achievement secret
        }
    ]
    
    created_count = 0
    for achievement_data in achievements_data:
        # Ajouter l'URL d'icône vide si elle n'existe pas
        if 'icon_url' not in achievement_data:
            achievement_data['icon_url'] = ''
        
        achievement, created = Achievement.objects.get_or_create(
            name=achievement_data['name'],
            defaults=achievement_data
        )
        if created:
            created_count += 1
    
    print(f"✅ {created_count} achievements créés")
    return created_count

def create_enhanced_missions():
    """Créer des missions améliorées"""
    print("🎯 Création des missions améliorées...")
    
    enhanced_missions = [
        # Missions quotidiennes
        {
            'title': 'Trader du Jour',
            'description': 'Effectuez 3 trades aujourd\'hui',
            'mission_type': 'DAILY',
            'reward_xp': 75,
            'reward_money': Decimal('200.00'),
            'requirement': {'type': 'daily_trades', 'target': 3}
        },
        {
            'title': 'Profit Quotidien',
            'description': 'Réalisez au moins 50$ de profit aujourd\'hui',
            'mission_type': 'DAILY',
            'reward_xp': 100,
            'reward_money': Decimal('300.00'),
            'requirement': {'type': 'daily_profit', 'target': 50}
        },
        {
            'title': 'Explorateur Crypto',
            'description': 'Consultez les prix de 5 cryptomonnaies différentes',
            'mission_type': 'DAILY',
            'reward_xp': 50,
            'reward_money': Decimal('100.00'),
            'requirement': {'type': 'view_stocks', 'target': 5}
        },
        
        # Missions hebdomadaires
        {
            'title': 'Semaine Productive',
            'description': 'Effectuez au moins 15 trades cette semaine',
            'mission_type': 'WEEKLY',
            'reward_xp': 300,
            'reward_money': Decimal('1000.00'),
            'requirement': {'type': 'weekly_trades', 'target': 15}
        },
        {
            'title': 'Diversification Hebdomadaire',
            'description': 'Tradez au moins 4 cryptomonnaies différentes cette semaine',
            'mission_type': 'WEEKLY',
            'reward_xp': 250,
            'reward_money': Decimal('750.00'),
            'requirement': {'type': 'weekly_crypto_diversity', 'target': 4}
        },
        {
            'title': 'Bénéfices Hebdomadaires',
            'description': 'Réalisez au least 500$ de profit cette semaine',
            'mission_type': 'WEEKLY',
            'reward_xp': 400,
            'reward_money': Decimal('1500.00'),
            'requirement': {'type': 'weekly_profit', 'target': 500}
        },
        
        # Missions d'achievement
        {
            'title': 'Maître du Risque',
            'description': 'Maintenez un win rate supérieur à 70%',
            'mission_type': 'ACHIEVEMENT',
            'reward_xp': 500,
            'reward_money': Decimal('2000.00'),
            'requirement': {'type': 'win_rate', 'target': 70}
        },
        {
            'title': 'Portfolio de Rêve',
            'description': 'Atteignez une valeur de portfolio de 50,000$',
            'mission_type': 'ACHIEVEMENT',
            'reward_xp': 1000,
            'reward_money': Decimal('5000.00'),
            'requirement': {'type': 'portfolio_value', 'target': 50000}
        }
    ]
    
    created_count = 0
    for mission_data in enhanced_missions:
        mission, created = Mission.objects.get_or_create(
            title=mission_data['title'],
            defaults=mission_data
        )
        if created:
            created_count += 1
    
    print(f"✅ {created_count} missions améliorées créées")
    return created_count

def setup_demo_user_gamification():
    """Configurer la gamification pour l'utilisateur de démonstration"""
    print("👤 Configuration de l'utilisateur de démonstration...")
    
    try:
        demo_user = User.objects.get(username='testuser')
        profile, created = UserProfile.objects.get_or_create(user=demo_user)
        
        # Améliorer le profil de démonstration
        profile.total_trades = 15
        profile.successful_trades = 12
        profile.total_profit_loss = Decimal('2500.00')
        profile.xp = 850
        profile.level = 9
        profile.trading_score = profile.calculate_trading_score()
        profile.save()
        
        # Créer un streak quotidien
        streak, created = DailyStreak.objects.get_or_create(
            user=demo_user,
            defaults={
                'current_streak': 5,
                'longest_streak': 12
            }
        )
        
        # Créer quelques notifications de démonstration
        demo_notifications = [
            {
                'notification_type': 'LEVEL_UP',
                'title': 'Niveau 9 Atteint!',
                'message': 'Félicitations! Vous avez atteint le niveau 9. Continuez comme ça!'
            },
            {
                'notification_type': 'ACHIEVEMENT',
                'title': 'Premier Profit Débloqué!',
                'message': 'Vous avez débloqué l\'achievement "Premier Profit". +50 XP!'
            },
            {
                'notification_type': 'STREAK',
                'title': 'Streak de 5 Jours!',
                'message': 'Vous vous connectez depuis 5 jours consécutifs. Gardez le rythme!'
            }
        ]
        
        for notif_data in demo_notifications:
            Notification.objects.get_or_create(
                user=demo_user,
                title=notif_data['title'],
                defaults=notif_data
            )
        
        print(f"✅ Utilisateur de démonstration configuré (Niveau {profile.level}, {profile.xp} XP)")
        
    except User.DoesNotExist:
        print("⚠️ Utilisateur testuser non trouvé, créez-le d'abord")

def main():
    """Fonction principale d'initialisation"""
    print("🎮 Initialisation du Système de Gamification BourseX")
    print("=" * 60)
    
    total_created = 0
    
    # Créer les badges
    total_created += create_badges()
    
    # Créer les achievements
    total_created += create_achievements()
    
    # Créer les missions améliorées
    total_created += create_enhanced_missions()
    
    # Configurer l'utilisateur de démonstration
    setup_demo_user_gamification()
    
    print("\n" + "=" * 60)
    print(f"🎉 GAMIFICATION INITIALISÉE AVEC SUCCÈS!")
    print(f"📊 Total d'éléments créés: {total_created}")
    print("\n🎯 FONCTIONNALITÉS DISPONIBLES:")
    print("   • 🏆 Système de badges avancé (Bronze → Diamond)")
    print("   • 🎯 Achievements progressifs et secrets")
    print("   • 📈 Leaderboards multiples (XP, Profit, Trades)")
    print("   • 🔥 Système de streaks quotidiens")
    print("   • 🔔 Notifications en temps réel")
    print("   • 📊 Score de trading personnalisé")
    print("   • 🎖️ Missions quotidiennes/hebdomadaires")
    print("\n🚀 API ENDPOINTS DISPONIBLES:")
    print("   • /api/badges/ - Gestion des badges")
    print("   • /api/leaderboard/ - Classements")
    print("   • /api/achievements/ - Achievements")
    print("   • /api/notifications/ - Notifications")
    print("   • /api/gamification/ - Résumé complet")
    print("\n✨ Votre système de gamification est maintenant 100% fonctionnel!")

if __name__ == '__main__':
    main()
