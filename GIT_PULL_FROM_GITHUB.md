# 🔄 Pull Changes from GitHub Repository

## Your Repository
**URL:** https://github.com/UVineethaa/collegedata

---

## 🚀 Quick Pull (If Already Connected)

```bash
# Navigate to your project
cd C:\Users\uppad\OneDrive\Desktop\MERN-School-Management-System

# Pull latest changes
git pull origin main
```

---

## 🔧 First Time Setup

If you haven't connected to this repository yet:

### Step 1: Check Current Remote
```bash
git remote -v
```

**If it shows a different repository:**
```bash
# Remove old remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/UVineethaa/collegedata.git

# Verify
git remote -v
```

### Step 2: Pull Changes
```bash
# Fetch all branches
git fetch origin

# Pull main branch
git pull origin main
```

---

## 📥 Complete Pull Process

### Method 1: Simple Pull (No Local Changes)
```bash
cd C:\Users\uppad\OneDrive\Desktop\MERN-School-Management-System
git pull origin main
```

### Method 2: Pull with Local Changes (Stash)
```bash
# Save your local changes
git stash

# Pull latest code
git pull origin main

# Reapply your changes
git stash pop
```

### Method 3: Pull and Merge
```bash
# Commit your local changes first
git add .
git commit -m "My local changes"

# Pull and merge
git pull origin main

# If conflicts, resolve them and commit
git add .
git commit -m "Merged with remote"
```

---

## 🔄 Update Remote URL

If your remote is pointing to the wrong repository:

```bash
# Check current remote
git remote -v

# Update to correct URL
git remote set-url origin https://github.com/UVineethaa/collegedata.git

# Verify
git remote -v
```

Should show:
```
origin  https://github.com/UVineethaa/collegedata.git (fetch)
origin  https://github.com/UVineethaa/collegedata.git (push)
```

---

## 🐛 Troubleshooting

### Problem: "fatal: refusing to merge unrelated histories"

**Solution:**
```bash
git pull origin main --allow-unrelated-histories
```

### Problem: "Repository not found"

**Solution:**
```bash
# Make sure URL is correct
git remote set-url origin https://github.com/UVineethaa/collegedata.git

# Try again
git pull origin main
```

### Problem: "Your local changes would be overwritten"

**Solution 1: Save your changes**
```bash
git stash
git pull origin main
git stash pop
```

**Solution 2: Discard local changes (⚠️ Be careful!)**
```bash
git reset --hard origin/main
git pull origin main
```

### Problem: "Merge conflicts"

**Solution:**
```bash
# Pull the changes
git pull origin main

# Open conflicted files
# Look for markers: <<<<<<< HEAD, =======, >>>>>>>

# Edit files to resolve conflicts

# Mark as resolved
git add .
git commit -m "Resolved merge conflicts"
```

---

## 📋 Step-by-Step Guide

### 1. Check Your Current Status
```bash
cd C:\Users\uppad\OneDrive\Desktop\MERN-School-Management-System
git status
```

### 2. Check Remote Repository
```bash
git remote -v
```

**Expected:**
```
origin  https://github.com/UVineethaa/collegedata.git (fetch)
origin  https://github.com/UVineethaa/collegedata.git (push)
```

**If different, update it:**
```bash
git remote set-url origin https://github.com/UVineethaa/collegedata.git
```

### 3. Save Your Local Work (If Any)
```bash
# Check what changed
git status

# If you have changes, save them
git add .
git commit -m "Saved local changes before pull"
```

### 4. Pull Latest Code
```bash
git pull origin main
```

### 5. Verify Pull Succeeded
```bash
git log --oneline -5
```

---

## 🔍 Check What Changed

### See what files changed:
```bash
git diff HEAD~1 HEAD --name-only
```

### See detailed changes:
```bash
git diff HEAD~1 HEAD
```

### See commit history:
```bash
git log --oneline -10
```

---

## 🎯 Complete Workflow

```bash
# 1. Navigate to project
cd C:\Users\uppad\OneDrive\Desktop\MERN-School-Management-System

# 2. Check status
git status

# 3. Save local changes (if any)
git add .
git commit -m "Local changes"

# 4. Update remote URL (if needed)
git remote set-url origin https://github.com/UVineethaa/collegedata.git

# 5. Pull latest code
git pull origin main

# 6. If conflicts, resolve them
# Edit conflicted files
git add .
git commit -m "Resolved conflicts"

# 7. Verify
git log --oneline -5
```

---

## 🚨 Force Pull (Nuclear Option)

**⚠️ WARNING: This will DELETE all your local changes!**

Only use if you want to completely replace your local code with remote code:

```bash
# Backup first (optional)
git stash

# Force pull
git fetch origin
git reset --hard origin/main

# Verify
git status
```

---

## 📦 After Pulling

### 1. Install New Dependencies (If Any)
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Update Database (If Schema Changed)
```bash
cd backend
npx prisma generate
npx prisma db push
```

### 3. Restart Servers
```bash
# Stop current servers (Ctrl+C)

# Start backend
cd backend
npm start

# Start frontend (new terminal)
cd frontend
npm start
```

---

## 🎉 Quick Commands

```bash
# Pull latest code
git pull origin main

# Pull and overwrite local changes
git fetch origin
git reset --hard origin/main

# Pull with stash
git stash && git pull origin main && git stash pop

# Update remote URL
git remote set-url origin https://github.com/UVineethaa/collegedata.git

# Check remote
git remote -v

# Check status
git status

# See recent commits
git log --oneline -10
```

---

## 📞 Need Help?

### Check if pull worked:
```bash
git log --oneline -5
```

### Check what changed:
```bash
git diff HEAD~1 HEAD --stat
```

### Undo pull (if something went wrong):
```bash
git reset --hard HEAD~1
```

---

## ✅ Success Checklist

After pulling, verify:
- [ ] No error messages
- [ ] `git status` shows "up to date"
- [ ] `git log` shows recent commits
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Application works correctly

---

**Ready to pull? Run:**
```bash
cd C:\Users\uppad\OneDrive\Desktop\MERN-School-Management-System
git remote set-url origin https://github.com/UVineethaa/collegedata.git
git pull origin main
```
