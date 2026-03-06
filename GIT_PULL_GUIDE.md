# 📥 Git Pull & Repository Management Guide

## Quick Start - Pull Latest Code

### If You Already Have the Repo Cloned

```bash
# Navigate to your project folder
cd C:\Users\uppad\OneDrive\Desktop\MERN-School-Management-System

# Pull latest changes
git pull origin main
```

That's it! ✅

---

## Complete Git Workflow Guide

### 1. First Time Setup (Clone Repository)

If you're starting fresh on a new computer:

```bash
# Navigate to where you want the project
cd C:\Users\uppad\OneDrive\Desktop

# Clone the repository
git clone https://github.com/mentlearn/collegedataa.git

# Enter the project folder
cd collegedataa

# Install dependencies
cd backend
npm install

cd ../frontend
npm install
```

---

### 2. Check Current Status

Before pulling, check what's changed:

```bash
# Check current status
git status

# Check which branch you're on
git branch

# Check remote repository
git remote -v
```

**Expected Output:**
```
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

---

### 3. Pull Latest Changes

#### Simple Pull (Recommended)
```bash
git pull origin main
```

#### Pull with Rebase (Cleaner History)
```bash
git pull --rebase origin main
```

#### Pull All Branches
```bash
git pull --all
```

---

### 4. Handle Conflicts

If you have local changes and pull fails:

#### Option A: Stash Your Changes (Save for Later)
```bash
# Save your current changes
git stash

# Pull latest code
git pull origin main

# Reapply your changes
git stash pop
```

#### Option B: Commit Your Changes First
```bash
# Add all changes
git add .

# Commit your changes
git commit -m "My local changes"

# Pull latest code
git pull origin main
```

#### Option C: Discard Local Changes (⚠️ Be Careful!)
```bash
# Discard all local changes
git reset --hard origin/main

# Pull latest code
git pull origin main
```

---

### 5. Complete Workflow Example

#### Scenario: You made changes and want to pull latest code

```bash
# Step 1: Check status
git status

# Step 2: Save your work
git add .
git commit -m "My changes before pull"

# Step 3: Pull latest code
git pull origin main

# Step 4: If conflicts, resolve them
# Edit conflicted files
# Then:
git add .
git commit -m "Resolved conflicts"

# Step 5: Push your changes
git push origin main
```

---

## Common Git Commands

### Checking Status
```bash
# See what changed
git status

# See commit history
git log

# See commit history (one line per commit)
git log --oneline

# See last 5 commits
git log -5

# See changes in files
git diff
```

### Pulling Code
```bash
# Pull from main branch
git pull origin main

# Pull and rebase
git pull --rebase origin main

# Pull specific branch
git pull origin branch-name

# Force pull (overwrite local)
git fetch origin
git reset --hard origin/main
```

### Pushing Code
```bash
# Push to main branch
git push origin main

# Push all branches
git push --all

# Force push (⚠️ dangerous)
git push -f origin main
```

### Branches
```bash
# List all branches
git branch -a

# Create new branch
git branch feature-name

# Switch to branch
git checkout feature-name

# Create and switch to new branch
git checkout -b feature-name

# Delete branch
git branch -d feature-name

# Merge branch into current
git merge feature-name
```

### Stashing (Temporary Save)
```bash
# Save current changes
git stash

# List all stashes
git stash list

# Apply last stash
git stash pop

# Apply specific stash
git stash apply stash@{0}

# Delete stash
git stash drop

# Clear all stashes
git stash clear
```

---

## Troubleshooting

### Problem: "Your local changes would be overwritten"

**Solution 1: Save your changes**
```bash
git stash
git pull origin main
git stash pop
```

**Solution 2: Commit your changes**
```bash
git add .
git commit -m "Save my work"
git pull origin main
```

**Solution 3: Discard your changes (⚠️ careful!)**
```bash
git reset --hard HEAD
git pull origin main
```

---

### Problem: "Merge conflict"

When you see:
```
CONFLICT (content): Merge conflict in file.js
Automatic merge failed; fix conflicts and then commit the result.
```

**Solution:**
```bash
# Step 1: Open the conflicted file
# Look for markers like:
# <<<<<<< HEAD
# Your changes
# =======
# Their changes
# >>>>>>> branch-name

# Step 2: Edit the file and choose what to keep

# Step 3: Mark as resolved
git add file.js

# Step 4: Complete the merge
git commit -m "Resolved merge conflict"

# Step 5: Push
git push origin main
```

---

### Problem: "fatal: not a git repository"

**Solution:**
```bash
# You're not in a git folder
# Navigate to your project:
cd C:\Users\uppad\OneDrive\Desktop\MERN-School-Management-System

# Or initialize git:
git init
git remote add origin https://github.com/mentlearn/collegedataa.git
git pull origin main
```

---

### Problem: "Permission denied (publickey)"

**Solution:**
```bash
# Use HTTPS instead of SSH
git remote set-url origin https://github.com/mentlearn/collegedataa.git

# Then pull
git pull origin main
```

---

### Problem: "Repository not found"

**Solution:**
```bash
# Check remote URL
git remote -v

# Update remote URL
git remote set-url origin https://github.com/mentlearn/collegedataa.git

# Verify
git remote -v
```

---

### Problem: "fatal: refusing to merge unrelated histories"

**Solution:**
```bash
git pull origin main --allow-unrelated-histories
```

---

## Your Repository Setup

Based on your project:

```bash
# Your repository URL
https://github.com/mentlearn/collegedataa.git

# Your local path
C:\Users\uppad\OneDrive\Desktop\MERN-School-Management-System

# Your branch
main
```

### Check Your Setup
```bash
# Navigate to project
cd C:\Users\uppad\OneDrive\Desktop\MERN-School-Management-System

# Check remote
git remote -v

# Should show:
# origin  https://github.com/mentlearn/collegedataa.git (fetch)
# origin  https://github.com/mentlearn/collegedataa.git (push)
```

---

## Daily Workflow

### Morning: Pull Latest Code
```bash
cd C:\Users\uppad\OneDrive\Desktop\MERN-School-Management-System
git pull origin main
```

### During Work: Save Your Progress
```bash
# Every hour or after completing a feature
git add .
git commit -m "Describe what you did"
git push origin main
```

### Evening: Push Your Work
```bash
# Make sure everything is saved
git status

# If there are changes
git add .
git commit -m "End of day commit"
git push origin main
```

---

## Best Practices

### ✅ DO:
- Pull before starting work each day
- Commit small, logical changes
- Write clear commit messages
- Push your work regularly
- Check status before pulling

### ❌ DON'T:
- Don't force push unless necessary
- Don't commit sensitive data (.env files)
- Don't commit node_modules
- Don't work on main branch for big features
- Don't ignore merge conflicts

---

## Quick Reference Commands

```bash
# Pull latest code
git pull origin main

# Save and push your work
git add .
git commit -m "Your message"
git push origin main

# Temporarily save changes
git stash
git pull origin main
git stash pop

# Discard all local changes
git reset --hard origin/main

# Check status
git status

# See history
git log --oneline

# Update remote URL
git remote set-url origin https://github.com/mentlearn/collegedataa.git
```

---

## Step-by-Step: Pull Code Right Now

### 1. Open Terminal/Command Prompt

**Windows:**
- Press `Win + R`
- Type `cmd` or `powershell`
- Press Enter

### 2. Navigate to Project
```bash
cd C:\Users\uppad\OneDrive\Desktop\MERN-School-Management-System
```

### 3. Check Status
```bash
git status
```

### 4. If You Have Changes
```bash
# Option A: Save them
git stash

# Option B: Commit them
git add .
git commit -m "My local changes"

# Option C: Discard them (⚠️ careful!)
git reset --hard HEAD
```

### 5. Pull Latest Code
```bash
git pull origin main
```

### 6. If You Stashed Changes
```bash
git stash pop
```

### 7. Done! ✅

---

## Visual Studio Code Git

If you're using VS Code:

### Pull Using VS Code
1. Click Source Control icon (left sidebar)
2. Click `...` (three dots)
3. Click `Pull`

### Or Use Command Palette
1. Press `Ctrl + Shift + P`
2. Type `Git: Pull`
3. Press Enter

---

## GitHub Desktop (Alternative)

If you prefer a GUI:

### Install GitHub Desktop
1. Download: https://desktop.github.com/
2. Install and open
3. Sign in with GitHub account

### Clone Repository
1. File → Clone Repository
2. Enter: `https://github.com/mentlearn/collegedataa.git`
3. Choose location
4. Click Clone

### Pull Changes
1. Click `Fetch origin`
2. Click `Pull origin`

---

## Summary

**To pull latest code:**
```bash
cd C:\Users\uppad\OneDrive\Desktop\MERN-School-Management-System
git pull origin main
```

**If you have local changes:**
```bash
git stash
git pull origin main
git stash pop
```

**To push your changes:**
```bash
git add .
git commit -m "Your message"
git push origin main
```

---

## Need Help?

### Check Git Status
```bash
git status
```

### Check Remote
```bash
git remote -v
```

### Check Branch
```bash
git branch
```

### Get Help
```bash
git help
git help pull
git help push
```

---

*Remember: Always pull before starting work, and push when you're done!* 🚀
