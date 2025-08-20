@echo off
echo Building VelFranceLux...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b %errorlevel%
)

echo Starting production server...
call npm start
