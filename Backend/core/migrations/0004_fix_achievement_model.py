# Generated migration to fix Achievement model

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_gamification_models'),
    ]

    operations = [
        # Ajout du champ badge manquant dans Achievement
        migrations.AddField(
            model_name='achievement',
            name='badge',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='core.badge'),
        ),
        
        # Ajout des champs manquants dans Achievement
        migrations.AddField(
            model_name='achievement',
            name='icon_url',
            field=models.URLField(blank=True),
        ),
    ]
