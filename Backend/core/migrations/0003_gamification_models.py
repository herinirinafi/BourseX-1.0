# Generated migration for gamification models

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_mission_transaction_userprofile_portfolio_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # Ajout des nouveaux champs à UserProfile
        migrations.AddField(
            model_name='userprofile',
            name='risk_tolerance',
            field=models.CharField(
                choices=[('LOW', 'Low'), ('MEDIUM', 'Medium'), ('HIGH', 'High')],
                default='MEDIUM',
                max_length=6
            ),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='total_trades',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='successful_trades',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='total_profit_loss',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=12),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='bio',
            field=models.TextField(blank=True, max_length=500),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='avatar_url',
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='preferences',
            field=models.JSONField(default=dict),
        ),
        
        # Création du modèle Badge
        migrations.CreateModel(
            name='Badge',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField()),
                ('badge_type', models.CharField(
                    choices=[
                        ('TRADING', 'Trading'), ('PROFIT', 'Profit'), ('VOLUME', 'Volume'),
                        ('STREAK', 'Streak'), ('LEARNING', 'Learning'), ('SOCIAL', 'Social'),
                        ('ACHIEVEMENT', 'Achievement'), ('SPECIAL', 'Special')
                    ],
                    max_length=11
                )),
                ('tier', models.CharField(
                    choices=[
                        ('BRONZE', 'Bronze'), ('SILVER', 'Silver'), ('GOLD', 'Gold'),
                        ('PLATINUM', 'Platinum'), ('DIAMOND', 'Diamond')
                    ],
                    default='BRONZE',
                    max_length=8
                )),
                ('icon_url', models.URLField(blank=True)),
                ('requirement', models.JSONField(default=dict)),
                ('xp_bonus', models.IntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'unique_together': {('name', 'tier')},
            },
        ),
        
        # Création du modèle UserBadge
        migrations.CreateModel(
            name='UserBadge',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('earned_at', models.DateTimeField(auto_now_add=True)),
                ('badge', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.badge')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user', 'badge')},
            },
        ),
        
        # Création du modèle Achievement
        migrations.CreateModel(
            name='Achievement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('description', models.TextField()),
                ('category', models.CharField(
                    choices=[
                        ('TRADING', 'Trading'), ('PROFIT', 'Profit'), ('VOLUME', 'Volume'),
                        ('SOCIAL', 'Social'), ('LEARNING', 'Learning'), ('MILESTONE', 'Milestone'),
                        ('SPECIAL', 'Special')
                    ],
                    max_length=9
                )),
                ('icon_url', models.URLField(blank=True)),
                ('requirement', models.JSONField(default=dict)),
                ('reward_xp', models.IntegerField(default=0)),
                ('reward_money', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                ('is_hidden', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        
        # Création du modèle UserAchievement
        migrations.CreateModel(
            name='UserAchievement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('progress', models.DecimalField(decimal_places=2, default=0.0, max_digits=5)),
                ('earned_at', models.DateTimeField(blank=True, null=True)),
                ('achievement', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.achievement')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user', 'achievement')},
            },
        ),
        
        # Création du modèle Leaderboard
        migrations.CreateModel(
            name='Leaderboard',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('leaderboard_type', models.CharField(
                    choices=[
                        ('XP', 'Experience Points'), ('PROFIT', 'Profit'), ('TRADES', 'Total Trades'),
                        ('WIN_RATE', 'Win Rate'), ('VOLUME', 'Trading Volume')
                    ],
                    max_length=8
                )),
                ('rank', models.PositiveIntegerField()),
                ('score', models.DecimalField(decimal_places=2, max_digits=12)),
                ('period_start', models.DateTimeField()),
                ('period_end', models.DateTimeField()),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user', 'leaderboard_type', 'period_start')},
            },
        ),
        
        # Création du modèle DailyStreak
        migrations.CreateModel(
            name='DailyStreak',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('current_streak', models.IntegerField(default=0)),
                ('longest_streak', models.IntegerField(default=0)),
                ('last_activity_date', models.DateField(auto_now_add=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        
        # Création du modèle Notification
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('notification_type', models.CharField(
                    choices=[
                        ('BADGE', 'Badge Earned'), ('ACHIEVEMENT', 'Achievement Unlocked'),
                        ('LEVEL_UP', 'Level Up'), ('MISSION', 'Mission Complete'),
                        ('TRADE', 'Trade Alert'), ('SOCIAL', 'Social'), ('SYSTEM', 'System')
                    ],
                    max_length=11
                )),
                ('title', models.CharField(max_length=200)),
                ('message', models.TextField()),
                ('data', models.JSONField(blank=True, default=dict)),
                ('is_read', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
