@echo off
echo 🚀 Démarrage BourseX avec gamification...
echo.

cd /d "C:\Users\Tanjona\BourseX-1.0\Frontend"

echo 📱 Tentative de démarrage en mode offline...
npx expo start --offline --localhost

if errorlevel 1 (
    echo.
    echo ❌ Erreur en mode offline, tentative avec cache clear...
    npx expo start --clear --offline
)

if errorlevel 1 (
    echo.
    echo ❌ Erreur persistante, tentative basique...
    npx expo start --localhost
)

if errorlevel 1 (
    echo.
    echo ❌ Impossible de démarrer Expo
    echo 💡 Solutions alternatives:
    echo    1. Vérifiez votre connexion internet
    echo    2. Désactivez temporairement antivirus/firewall
    echo    3. Utilisez: npm run start:local
    echo    4. Consultez ERREUR_EXPO_SOLUTION.md
    pause
)

echo.
echo ✅ Expo démarré! Scannez le QR code avec Expo Go
echo 🎮 Votre système de gamification est prêt!
pause
