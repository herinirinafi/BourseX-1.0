@echo off
echo ================================
echo BourseX Mobile Setup Helper
echo ================================
echo.

echo Finding your IP address...
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set ip=%%a
    set ip=!ip: =!
    echo Found IP: !ip!
)

echo.
echo INSTRUCTIONS:
echo =============
echo 1. Your computer's IP address should be shown above
echo 2. Open: Frontend\src\config\mobile-config.ts
echo 3. Replace 'IP_ADDRESS: "192.168.1.120"' with your actual IP
echo 4. Save the file
echo 5. Restart your Expo development server
echo 6. Make sure Django backend is running: python manage.py runserver 0.0.0.0:8000
echo.
echo Note: If you see multiple IPs, use the one starting with 192.168 or 10.0
echo.
pause
