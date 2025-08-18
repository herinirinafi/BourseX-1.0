"""
Demo Data Setup Script for BourseX Professional
Creates realistic trading data for presentation demos
"""

import os
import sys
import django
from decimal import Decimal
from datetime import datetime, timedelta
import random

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'boursex_api.settings')
django.setup()

from core.models import (
    User, UserProfile, Stock, Portfolio, Transaction, 
    Badge, UserBadge, Leaderboard, Mission, UserMission, Notification
)
from django.contrib.auth import get_user_model

User = get_user_model()

class DemoDataCreator:
    def __init__(self):
        self.stocks_data = [
            # Premium Technology Stocks (prices in MGA)
            {"symbol": "AAPL", "name": "Apple Inc.", "current_price": 500000.00, "sector": "Technology"},
            {"symbol": "MSFT", "name": "Microsoft Corporation", "current_price": 750000.00, "sector": "Technology"},
            {"symbol": "GOOGL", "name": "Alphabet Inc.", "current_price": 400000.00, "sector": "Technology"},
            {"symbol": "TSLA", "name": "Tesla Inc.", "current_price": 600000.00, "sector": "Automotive"},
            {"symbol": "NVDA", "name": "NVIDIA Corporation", "current_price": 1200000.00, "sector": "Technology"},
            
            # Financial & Banking
            {"symbol": "JPM", "name": "JPMorgan Chase & Co.", "current_price": 350000.00, "sector": "Finance"},
            {"symbol": "BAC", "name": "Bank of America Corp", "current_price": 80000.00, "sector": "Finance"},
            {"symbol": "GS", "name": "Goldman Sachs Group", "current_price": 900000.00, "sector": "Finance"},
            
            # Luxury & Consumer
            {"symbol": "LVMH", "name": "LVMH Moët Hennessy", "current_price": 1500000.00, "sector": "Luxury"},
            {"symbol": "MC", "name": "LVMH SE", "current_price": 1300000.00, "sector": "Luxury"},
            
            # Energy & Commodities
            {"symbol": "XOM", "name": "Exxon Mobil Corporation", "current_price": 250000.00, "sector": "Energy"},
            {"symbol": "CVX", "name": "Chevron Corporation", "current_price": 380000.00, "sector": "Energy"},
            
            # Healthcare & Pharma
            {"symbol": "PFE", "name": "Pfizer Inc.", "current_price": 85000.00, "sector": "Healthcare"},
            {"symbol": "JNJ", "name": "Johnson & Johnson", "current_price": 390000.00, "sector": "Healthcare"},
            
            # Entertainment & Media
            {"symbol": "DIS", "name": "The Walt Disney Company", "current_price": 440000.00, "sector": "Entertainment"},
        ]
        
        self.badges_data = [
            {"name": "Premier Trade", "description": "Votre première transaction", "xp_reward": 100, "icon": "trophy"},
            {"name": "Investisseur Prudent", "description": "5 trades rentables consécutifs", "xp_reward": 250, "icon": "shield"},
            {"name": "Bull Market", "description": "Gain de +10% en une journée", "xp_reward": 500, "icon": "trending-up"},
            {"name": "Portfolio Diversifié", "description": "Détenir 5 actions différentes", "xp_reward": 300, "icon": "briefcase"},
            {"name": "Trader Actif", "description": "100 transactions complétées", "xp_reward": 750, "icon": "flash"},
            {"name": "Millionnaire", "description": "Atteindre 1 milliard MGA de portfolio", "xp_reward": 2000, "icon": "diamond"},
            {"name": "Série Gagnante", "description": "10 jours de trading consécutifs", "xp_reward": 600, "icon": "flame"},
            {"name": "Expert Technologie", "description": "Focus sur les actions tech", "xp_reward": 400, "icon": "laptop"},
        ]
        
        self.missions_data = [
            {"title": "Première Transaction", "description": "Effectuez votre premier achat d'actions", "xp_reward": 150, "type": "TRADE"},
            {"title": "Diversification", "description": "Achetez 3 actions différentes", "xp_reward": 300, "type": "PORTFOLIO"},
            {"title": "Trader Quotidien", "description": "Effectuez une transaction aujourd'hui", "xp_reward": 100, "type": "DAILY"},
            {"title": "Portfolio 10K", "description": "Atteignez 10,000,000 MGA de valeur portfolio", "xp_reward": 500, "type": "MILESTONE"},
            {"title": "Bull Run", "description": "Réalisez 3 trades rentables de suite", "xp_reward": 400, "type": "STREAK"},
        ]

    def create_premium_users(self):
        """Create premium demo users with different profiles"""
        
        # Main demo user
        demo_user, created = User.objects.get_or_create(
            username="testuser",
            defaults={
                "email": "demo@boursex.fr",
                "first_name": "Alexandre",
                "last_name": "Martin"
            }
        )
        if created:
            demo_user.set_password("testpass123")
            demo_user.save()
        
        # Create premium profile
        profile, created = UserProfile.objects.get_or_create(
            user=demo_user,
            defaults={
                "balance": Decimal("5000000.00"),  # 5 million MGA (premium starting balance)
                "xp": 2500,
                "level": 8,
                "total_trades": 47,
                "total_profit_loss": Decimal("500000.00"),  # 500k MGA profit
            }
        )
        
        # VIP demo user
        vip_user, created = User.objects.get_or_create(
            username="vip_trader",
            defaults={
                "email": "vip@boursex.fr",
                "first_name": "Sophie",
                "last_name": "Dubois"
            }
        )
        if created:
            vip_user.set_password("vippass123")
            vip_user.save()
        
        vip_profile, created = UserProfile.objects.get_or_create(
            user=vip_user,
            defaults={
                "balance": Decimal("15000000.00"),  # 15 million MGA (VIP balance)
                "xp": 8500,
                "level": 15,
                "total_trades": 156,
                "total_profit_loss": Decimal("2500000.00"),  # 2.5 million MGA profit
            }
        )
        
        # Professional trader
        pro_user, created = User.objects.get_or_create(
            username="pro_investor",
            defaults={
                "email": "pro@boursex.fr",
                "first_name": "Jean-Marc",
                "last_name": "Laurent"
            }
        )
        if created:
            pro_user.set_password("propass123")
            pro_user.save()
        
        pro_profile, created = UserProfile.objects.get_or_create(
            user=pro_user,
            defaults={
                "balance": Decimal("50000000.00"),  # 50 million MGA (professional balance)
                "xp": 15000,
                "level": 25,
                "total_trades": 324,
                "total_profit_loss": Decimal("8000000.00"),  # 8 million MGA profit
            }
        )
        
        return [demo_user, vip_user, pro_user]

    def create_stocks(self):
        """Create realistic stock data"""
        print("Creating premium stocks...")
        
        for stock_data in self.stocks_data:
            stock, created = Stock.objects.get_or_create(
                symbol=stock_data["symbol"],
                defaults={
                    "name": stock_data["name"],
                    "current_price": Decimal(str(stock_data["current_price"])),
                    "volume": random.randint(1000000, 50000000),
                }
            )
            
            if created:
                print(f"Created stock: {stock.symbol} - {stock.name}")

    def create_portfolios_and_transactions(self, users):
        """Create realistic portfolios with transaction history"""
        print("Creating professional portfolios...")
        
        for user in users:
            profile = user.userprofile
            
            # Select random stocks for portfolio
            selected_stocks = random.sample(
                list(Stock.objects.all()), 
                random.randint(3, 7)
            )
            
            for stock in selected_stocks:
                # Create portfolio holding
                quantity = random.randint(5, 50)
                avg_price = stock.current_price * Decimal(str(random.uniform(0.85, 1.15)))
                
                portfolio, created = Portfolio.objects.get_or_create(
                    user=user,
                    stock=stock,
                    defaults={
                        "quantity": quantity,
                        "average_price": avg_price,
                    }
                )
                
                if created:
                    # Create multiple transactions for this holding
                    transactions_count = random.randint(2, 8)
                    total_bought = 0
                    
                    for i in range(transactions_count):
                        trade_date = datetime.now() - timedelta(days=random.randint(1, 90))
                        
                        if total_bought < quantity:
                            # BUY transaction
                            buy_quantity = min(
                                random.randint(1, quantity // transactions_count + 5),
                                quantity - total_bought
                            )
                            total_bought += buy_quantity
                            
                            buy_price = avg_price * Decimal(str(random.uniform(0.92, 1.08)))
                            total_cost = buy_quantity * buy_price
                            
                            Transaction.objects.create(
                                user=user,
                                stock=stock,
                                transaction_type="BUY",
                                quantity=buy_quantity,
                                price=buy_price,
                                total_amount=total_cost,
                                timestamp=trade_date,
                            )
                        
                        # Occasionally add SELL transactions
                        if i > 2 and random.random() < 0.3:
                            sell_quantity = random.randint(1, min(5, total_bought))
                            total_bought -= sell_quantity
                            
                            sell_price = stock.current_price * Decimal(str(random.uniform(0.95, 1.12)))
                            total_revenue = sell_quantity * sell_price
                            
                            Transaction.objects.create(
                                user=user,
                                stock=stock,
                                transaction_type="SELL",
                                quantity=sell_quantity,
                                price=sell_price,
                                total_amount=total_revenue,
                                timestamp=trade_date + timedelta(hours=random.randint(1, 48)),
                            )
                    
                    # Update portfolio quantity to match net purchases
                    portfolio.quantity = total_bought
                    portfolio.save()
                    
                    print(f"Created portfolio: {user.username} - {stock.symbol} ({total_bought} shares)")

    def create_gamification_system(self, users):
        """Create badges, achievements, and missions"""
        print("Setting up gamification system...")
        
        # Create badges
        for badge_data in self.badges_data:
            badge, created = Badge.objects.get_or_create(
                name=badge_data["name"],
                defaults={
                    "description": badge_data["description"],
                    "xp_bonus": badge_data["xp_reward"],
                    "badge_type": "ACHIEVEMENT",
                    "tier": "BRONZE",
                    "icon_url": f"https://example.com/icons/{badge_data['icon']}.png",
                }
            )
            if created:
                print(f"Created badge: {badge.name}")
        
        # Create missions
        for mission_data in self.missions_data:
            mission, created = Mission.objects.get_or_create(
                title=mission_data["title"],
                defaults={
                    "description": mission_data["description"],
                    "reward_xp": mission_data["xp_reward"],
                    "mission_type": mission_data["type"],
                    "is_active": True,
                }
            )
            if created:
                print(f"Created mission: {mission.title}")
        
        # Award badges to users
        all_badges = list(Badge.objects.all())
        for user in users:
            # Award some badges based on user level
            profile = user.userprofile
            badges_to_award = random.sample(
                all_badges, 
                min(profile.level // 3 + 2, len(all_badges))
            )
            
            for badge in badges_to_award:
                UserBadge.objects.get_or_create(
                    user=user,
                    badge=badge,
                    defaults={
                        "earned_at": datetime.now() - timedelta(days=random.randint(1, 30))
                    }
                )
        
        # Create user missions
        all_missions = list(Mission.objects.all())
        for user in users:
            for mission in random.sample(all_missions, 3):
                UserMission.objects.get_or_create(
                    user=user,
                    mission=mission,
                    defaults={
                        "is_completed": random.choice([True, False]),
                        "progress": random.randint(0, 100),
                        "completed_at": datetime.now() - timedelta(days=random.randint(1, 10)) if random.choice([True, False]) else None
                    }
                )

    def create_leaderboard(self, users):
        """Create leaderboard entries"""
        print("Creating leaderboard...")
        
        leaderboard_types = ["XP", "PROFIT", "TRADES"]
        
        for lb_type in leaderboard_types:
            for rank, user in enumerate(users, 1):
                profile = user.userprofile
                
                if lb_type == "XP":
                    value = profile.xp
                elif lb_type == "PROFIT":
                    value = profile.total_profit_loss
                else:  # TRADES
                    value = profile.total_trades
                
                Leaderboard.objects.get_or_create(
                    user=user,
                    leaderboard_type=lb_type,
                    period_start=datetime.now() - timedelta(days=30),
                    defaults={
                        "rank": rank,
                        "score": value,
                        "period_end": datetime.now(),
                    }
                )

    def create_notifications(self, users):
        """Create professional notifications"""
        print("Creating notifications...")
        
        notification_types = [
            {"title": "🎉 Nouveau Badge Débloqué!", "message": "Félicitations! Vous avez débloqué le badge 'Trader Actif'", "type": "ACHIEVEMENT"},
            {"title": "📈 Opportunité de Trading", "message": "AAPL montre une tendance haussière forte aujourd'hui", "type": "MARKET"},
            {"title": "🏆 Mission Accomplie", "message": "Mission 'Portfolio Diversifié' terminée avec succès!", "type": "MISSION"},
            {"title": "💰 Profit Réalisé", "message": "Votre trade TSLA a généré +12.5% de profit", "type": "TRADE"},
            {"title": "🔥 Série Impressionnante", "message": "12 jours de trading consécutifs! Continuez!", "type": "STREAK"},
        ]
        
        for user in users:
            for notif_data in random.sample(notification_types, 3):
                Notification.objects.create(
                    user=user,
                    title=notif_data["title"],
                    message=notif_data["message"],
                    notification_type=notif_data["type"],
                    is_read=random.choice([True, False]),
                    created_at=datetime.now() - timedelta(hours=random.randint(1, 72))
                )

    def run_full_setup(self):
        """Run complete demo data setup"""
        print("🚀 Setting up BourseX Professional Demo Data...")
        print("=" * 50)
        
        # Create users
        users = self.create_premium_users()
        print(f"✅ Created {len(users)} premium users")
        
        # Create stocks
        self.create_stocks()
        print(f"✅ Created {len(self.stocks_data)} premium stocks")
        
        # Create portfolios and transactions
        self.create_portfolios_and_transactions(users)
        print("✅ Created realistic portfolios and transaction history")
        
        # Setup gamification
        self.create_gamification_system(users)
        print("✅ Setup complete gamification system")
        
        # Create leaderboard
        self.create_leaderboard(users)
        print("✅ Created leaderboard rankings")
        
        # Create notifications
        self.create_notifications(users)
        print("✅ Created professional notifications")
        
        print("=" * 50)
        print("🎉 Demo data setup complete!")
        print("\nDemo Accounts:")
        for user in users:
            profile = user.userprofile
            print(f"👤 {user.username} - Balance: {profile.balance:,.2f} MGA - Level: {profile.level}")
        
        print("\n💎 Your professional trading platform is ready for demo!")

if __name__ == "__main__":
    creator = DemoDataCreator()
    creator.run_full_setup()
