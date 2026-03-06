@echo off
echo ========================================
echo Safe Git Pull (with Stash)
echo ========================================
echo.

echo This script will:
echo 1. Stash your current changes
echo 2. Pull from collegedata repository
echo 3. Reapply your changes
echo.
pause

echo Step 1: Stashing your changes...
git stash save "Auto-stash before pull: %date% %time%"
echo.

echo Step 2: Pulling from upstream...
git pull upstream main
echo.

echo Step 3: Reapplying your changes...
git stash pop
echo.

if %errorlevel% equ 0 (
    echo ========================================
    echo SUCCESS! Pull completed and changes restored.
    echo ========================================
) else (
    echo ========================================
    echo CONFLICTS DETECTED
    echo ========================================
    echo.
    echo Your stashed changes conflicted with pulled changes.
    echo Please resolve conflicts manually and run: git stash drop
)

echo.
echo Current status:
git status
echo.
pause
