@echo off
echo ========================================
echo Git Pull from collegedata Repository
echo ========================================
echo.

echo Step 1: Checking current status...
git status
echo.

echo Step 2: Committing your current changes...
git add .
git commit -m "Auto-commit before pull: %date% %time%"
echo.

echo Step 3: Pulling from upstream (collegedata)...
git pull upstream main
echo.

if %errorlevel% equ 0 (
    echo ========================================
    echo SUCCESS! Pull completed successfully.
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Check if there were any conflicts
    echo 2. Run: npm install in backend and frontend
    echo 3. Test your application
) else (
    echo ========================================
    echo CONFLICTS DETECTED or ERROR OCCURRED
    echo ========================================
    echo.
    echo Please resolve conflicts manually:
    echo 1. Open conflicted files in your editor
    echo 2. Look for conflict markers ^(^<^<^<^<^<^<^<^, ^=^=^=^=^=^=^=^, ^>^>^>^>^>^>^>^)
    echo 3. Edit to keep the code you want
    echo 4. Run: git add .
    echo 5. Run: git commit -m "Resolved conflicts"
)

echo.
pause
