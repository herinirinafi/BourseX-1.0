#!/usr/bin/env python
"""
Script de test rapide pour valider la configuration Django
"""
import os
import sys
import django

# Ajouter le répertoire Backend au PATH
sys.path.insert(0, r'C:\Users\Tanjona\BourseX-1.0\Backend')

# Configurer Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'boursex_api.settings')
django.setup()

try:
    # Test des imports
    from core.models import Badge, Achievement, UserProfile
    from core.views import BadgeViewSet, AchievementViewSet
    
    print("✅ Imports Django OK")
    
    # Test des modèles
    badge_count = Badge.objects.count()
    achievement_count = Achievement.objects.count()
    
    print(f"✅ Base de données accessible")
    print(f"   - Badges: {badge_count}")
    print(f"   - Achievements: {achievement_count}")
    
    # Test des URLs
    from django.conf import settings
    from django.urls import get_resolver
    
    resolver = get_resolver()
    print("✅ Configuration URLs OK")
    
    print("\n🎉 CONFIGURATION DJANGO VALIDE!")
    print("Le serveur peut maintenant être démarré avec:")
    print("python manage.py runserver")
    
except Exception as e:
    print(f"❌ ERREUR: {e}")
    import traceback
    traceback.print_exc()
