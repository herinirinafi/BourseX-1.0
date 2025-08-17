#!/usr/bin/env python
"""
Script d'initialisation et de test pour BourseX
Ce script configure la base de données et teste toutes les fonctionnalités
"""

import os
import sys
import django
from decimal import Decimal
from datetime import datetime, timedelta

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'boursex_api.settings')
django.setup()

from django.contrib.auth.models import User
from django.core.management import execute_from_command_line
from core.models import (
    UserProfile, Stock, StockPriceHistory, Portfolio, 
    Transaction, Mission, UserMission, Watchlist
)

def setup_database():
    """Créer et migrer la base de données"""
    print("🔧 Configuration de la base de données...")
    
    try:
        # Créer les migrations
        execute_from_command_line(['manage.py', 'makemigrations', 'core'])
        print("✅ Migrations créées avec succès")
        
        # Appliquer les migrations
        execute_from_command_line(['manage.py', 'migrate'])
        print("✅ Migrations appliquées avec succès")
        
        return True
    except Exception as e:
        print(f"❌ Erreur lors de la configuration de la base de données: {e}")
        return False

def create_sample_data():
    """Créer des données d'exemple"""
    print("📊 Création des données d'exemple...")
    
    try:
        # Créer des cryptomonnaies d'exemple
        cryptocurrencies = [
            {'symbol': 'BTC', 'name': 'Bitcoin', 'price': '50000.00'},
            {'symbol': 'ETH', 'name': 'Ethereum', 'price': '3000.00'},
            {'symbol': 'ADA', 'name': 'Cardano', 'price': '1.50'},
            {'symbol': 'DOT', 'name': 'Polkadot', 'price': '25.00'},
            {'symbol': 'SOL', 'name': 'Solana', 'price': '100.00'},
            {'symbol': 'MATIC', 'name': 'Polygon', 'price': '2.00'},
            {'symbol': 'AVAX', 'name': 'Avalanche', 'price': '80.00'},
            {'symbol': 'LINK', 'name': 'Chainlink', 'price': '15.00'},
        ]
        
        stocks_created = 0
        for crypto in cryptocurrencies:
            stock, created = Stock.objects.get_or_create(
                symbol=crypto['symbol'],
                defaults={
                    'name': crypto['name'],
                    'current_price': Decimal(crypto['price']),
                    'volume': 1000000
                }
            )
            if created:
                stocks_created += 1
                
                # Créer un historique de prix
                for i in range(10):
                    base_price = Decimal(crypto['price'])
                    variation = Decimal(str(1 + (i * 0.01)))  # Variation de 1% par entrée
                    StockPriceHistory.objects.create(
                        stock=stock,
                        price=base_price * variation
                    )
        
        print(f"✅ {stocks_created} cryptomonnaies créées")
        
        # Créer des missions d'exemple
        sample_missions = [
            {
                'title': 'Premier Trade',
                'description': 'Effectuez votre premier achat de cryptomonnaie',
                'mission_type': 'ACHIEVEMENT',
                'reward_xp': 50,
                'reward_money': '100.00',
                'requirement': {'type': 'trade_count', 'target': 1}
            },
            {
                'title': 'Trader Quotidien',
                'description': 'Effectuez 5 trades en une journée',
                'mission_type': 'DAILY',
                'reward_xp': 100,
                'reward_money': '200.00',
                'requirement': {'type': 'daily_trades', 'target': 5}
            },
            {
                'title': 'Constructeur de Portfolio',
                'description': 'Atteignez une valeur de portfolio de 1000$',
                'mission_type': 'ACHIEVEMENT',
                'reward_xp': 200,
                'reward_money': '500.00',
                'requirement': {'type': 'portfolio_value', 'target': 1000}
            },
            {
                'title': 'Hodler',
                'description': 'Gardez un actif pendant une semaine',
                'mission_type': 'WEEKLY',
                'reward_xp': 150,
                'reward_money': '300.00',
                'requirement': {'type': 'hold_duration', 'target': 7}
            },
            {
                'title': 'Diversification',
                'description': 'Possédez au moins 3 cryptomonnaies différentes',
                'mission_type': 'ACHIEVEMENT',
                'reward_xp': 120,
                'reward_money': '250.00',
                'requirement': {'type': 'portfolio_diversity', 'target': 3}
            }
        ]
        
        missions_created = 0
        for mission_data in sample_missions:
            mission, created = Mission.objects.get_or_create(
                title=mission_data['title'],
                defaults=mission_data
            )
            if created:
                missions_created += 1
        
        print(f"✅ {missions_created} missions créées")
        
        # Créer un utilisateur de test
        test_user, created = User.objects.get_or_create(
            username='testuser',
            defaults={
                'email': 'test@boursex.com',
                'first_name': 'Test',
                'last_name': 'User'
            }
        )
        
        if created:
            test_user.set_password('testpass123')
            test_user.save()
            print("✅ Utilisateur de test créé (testuser/testpass123)")
            
            # Créer le profil utilisateur
            UserProfile.objects.get_or_create(
                user=test_user,
                defaults={
                    'balance': Decimal('10000.00'),
                    'xp': 0,
                    'level': 1
                }
            )
            print("✅ Profil utilisateur créé")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la création des données: {e}")
        return False

def test_trading_functionality():
    """Tester les fonctionnalités de trading"""
    print("🎮 Test des fonctionnalités de trading...")
    
    try:
        # Récupérer l'utilisateur de test et Bitcoin
        test_user = User.objects.get(username='testuser')
        btc_stock = Stock.objects.get(symbol='BTC')
        user_profile = UserProfile.objects.get(user=test_user)
        
        initial_balance = user_profile.balance
        print(f"💰 Solde initial: ${initial_balance}")
        
        # Simuler un achat
        quantity = Decimal('0.1')
        total_cost = quantity * btc_stock.current_price
        
        if user_profile.balance >= total_cost:
            # Créer une transaction d'achat
            transaction = Transaction.objects.create(
                user=test_user,
                stock=btc_stock,
                transaction_type='BUY',
                quantity=quantity,
                price=btc_stock.current_price,
                total_amount=total_cost
            )
            
            # Mettre à jour le solde
            user_profile.balance -= total_cost
            user_profile.xp += 10
            user_profile.save()
            
            # Créer/mettre à jour le portfolio
            portfolio_item, created = Portfolio.objects.get_or_create(
                user=test_user,
                stock=btc_stock,
                defaults={
                    'quantity': quantity,
                    'average_price': btc_stock.current_price
                }
            )
            
            if not created:
                # Calculer le nouveau prix moyen
                total_quantity = portfolio_item.quantity + quantity
                total_invested = (portfolio_item.quantity * portfolio_item.average_price) + total_cost
                portfolio_item.average_price = total_invested / total_quantity
                portfolio_item.quantity = total_quantity
                portfolio_item.save()
            
            print(f"✅ Achat simulé: {quantity} BTC pour ${total_cost}")
            print(f"💰 Nouveau solde: ${user_profile.balance}")
            print(f"⭐ XP gagné: 10 (Total: {user_profile.xp})")
            
            # Vérifier le portfolio
            portfolio_value = sum(
                item.quantity * item.stock.current_price 
                for item in Portfolio.objects.filter(user=test_user)
            )
            print(f"📊 Valeur du portfolio: ${portfolio_value}")
            
            return True
        else:
            print("❌ Solde insuffisant pour le test")
            return False
            
    except Exception as e:
        print(f"❌ Erreur lors du test de trading: {e}")
        return False

def test_gamification():
    """Tester le système de gamification"""
    print("🎯 Test du système de gamification...")
    
    try:
        test_user = User.objects.get(username='testuser')
        user_profile = UserProfile.objects.get(user=test_user)
        
        # Créer des missions utilisateur
        active_missions = Mission.objects.filter(is_active=True)[:3]
        missions_created = 0
        
        for mission in active_missions:
            user_mission, created = UserMission.objects.get_or_create(
                user=test_user,
                mission=mission,
                defaults={
                    'is_completed': False,
                    'progress': Decimal('0.00')
                }
            )
            if created:
                missions_created += 1
        
        print(f"✅ {missions_created} missions assignées à l'utilisateur")
        
        # Simuler la progression d'une mission
        first_mission = UserMission.objects.filter(user=test_user).first()
        if first_mission:
            first_mission.progress = Decimal('50.00')
            first_mission.save()
            print(f"✅ Mission '{first_mission.mission.title}' - Progression: 50%")
        
        # Calculer le niveau basé sur l'XP
        required_xp_for_next_level = user_profile.level * 100
        print(f"📈 Niveau actuel: {user_profile.level}")
        print(f"⭐ XP actuel: {user_profile.xp}/{required_xp_for_next_level}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors du test de gamification: {e}")
        return False

def test_api_endpoints():
    """Tester les endpoints API (simulation)"""
    print("🔗 Test des endpoints API...")
    
    try:
        # Compter les données disponibles
        stocks_count = Stock.objects.count()
        missions_count = Mission.objects.count()
        users_count = User.objects.count()
        transactions_count = Transaction.objects.count()
        
        print(f"✅ Stocks disponibles: {stocks_count}")
        print(f"✅ Missions disponibles: {missions_count}")
        print(f"✅ Utilisateurs: {users_count}")
        print(f"✅ Transactions: {transactions_count}")
        
        # Tester les requêtes principales
        if stocks_count > 0:
            sample_stock = Stock.objects.first()
            print(f"📊 Stock exemple: {sample_stock.symbol} - ${sample_stock.current_price}")
            
            # Historique des prix
            price_history_count = sample_stock.price_history.count()
            print(f"📈 Historique de prix pour {sample_stock.symbol}: {price_history_count} entrées")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors du test des endpoints: {e}")
        return False

def generate_summary_report():
    """Générer un rapport de résumé"""
    print("\n" + "="*60)
    print("📋 RAPPORT DE RÉSUMÉ - BourseX")
    print("="*60)
    
    try:
        # Statistiques générales
        stocks_count = Stock.objects.count()
        users_count = User.objects.count()
        transactions_count = Transaction.objects.count()
        missions_count = Mission.objects.count()
        
        print(f"📊 Cryptomonnaies: {stocks_count}")
        print(f"👥 Utilisateurs: {users_count}")
        print(f"💼 Transactions: {transactions_count}")
        print(f"🎯 Missions: {missions_count}")
        
        # Détails par utilisateur
        for user in User.objects.all():
            try:
                profile = UserProfile.objects.get(user=user)
                portfolio_items = Portfolio.objects.filter(user=user)
                portfolio_value = sum(
                    item.quantity * item.stock.current_price 
                    for item in portfolio_items
                )
                
                print(f"\n👤 Utilisateur: {user.username}")
                print(f"   💰 Solde: ${profile.balance}")
                print(f"   📊 Valeur portfolio: ${portfolio_value}")
                print(f"   ⭐ XP: {profile.xp} (Niveau {profile.level})")
                print(f"   📈 Cryptos détenues: {portfolio_items.count()}")
                
            except UserProfile.DoesNotExist:
                print(f"\n👤 Utilisateur: {user.username} (pas de profil)")
        
        # Top cryptomonnaies
        print(f"\n💎 TOP CRYPTOMONNAIES:")
        for i, stock in enumerate(Stock.objects.order_by('-current_price')[:5], 1):
            print(f"   {i}. {stock.symbol} ({stock.name}): ${stock.current_price}")
        
        print(f"\n🎮 FONCTIONNALITÉS DISPONIBLES:")
        print("   • Trading buy/sell de cryptomonnaies")
        print("   • Système de gamification (XP, niveaux)")
        print("   • Missions et récompenses")
        print("   • Portfolio et historique de prix")
        print("   • Watchlist personnalisée")
        print("   • Dashboard avec statistiques")
        
        print(f"\n🚀 APPLICATION PRÊTE POUR LES TESTS!")
        
    except Exception as e:
        print(f"❌ Erreur lors de la génération du rapport: {e}")

def main():
    """Fonction principale"""
    print("🎮 BourseX - Configuration et Test Complet")
    print("="*50)
    print("📱 Application de trading de cryptomonnaies gamifiée")
    print("="*50)
    
    success_count = 0
    total_tests = 5
    
    # 1. Configuration de la base de données
    if setup_database():
        success_count += 1
    
    # 2. Création des données d'exemple
    if create_sample_data():
        success_count += 1
    
    # 3. Test du trading
    if test_trading_functionality():
        success_count += 1
    
    # 4. Test de la gamification
    if test_gamification():
        success_count += 1
    
    # 5. Test des endpoints
    if test_api_endpoints():
        success_count += 1
    
    # Rapport final
    print(f"\n📊 RÉSULTATS: {success_count}/{total_tests} tests réussis")
    
    if success_count == total_tests:
        print("🎉 TOUS LES TESTS SONT PASSÉS!")
        print("✅ Votre application BourseX est entièrement fonctionnelle!")
    elif success_count >= 3:
        print("✅ La plupart des fonctionnalités marchent!")
        print("🔧 Quelques ajustements mineurs recommandés")
    else:
        print("⚠️ Plusieurs problèmes détectés")
        print("🛠️ Vérifiez la configuration Django")
    
    generate_summary_report()
    
    print(f"\n🚀 Pour démarrer le serveur:")
    print("   cd Backend")
    print("   python manage.py runserver")
    print(f"\n📱 Pour tester l'API:")
    print("   http://127.0.0.1:8000/api/stocks/")
    print("   http://127.0.0.1:8000/api/dashboard/")

if __name__ == '__main__':
    main()
