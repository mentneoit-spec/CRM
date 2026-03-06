# Git Pull Commands Cheatsheet

## 🎯 Your Repository Setup
- **Your Repo**: https://github.com/UVineethaa/collegedata.git (configured as `upstream`)
- **Origin**: https://github.com/mentlearn/CRM.git

---

## ⚡ Quick Commands

### Pull from Your Repository (collegedata)
```bash
git pull upstream main
```

### Pull from Origin (CRM)
```bash
git pull origin main
```

---

## 📋 Complete Pull Workflow

### Option 1: Commit First (Recommended)
```bash
git add .
git commit -m "Your commit message"
git pull upstream main
```

### Option 2: Stash First (Safe)
```bash
git stash
git pull upstream main
git stash pop
```

### Option 3: Discard Changes (Dangerous!)
```bash
git restore .
git pull upstream main
```

---

## 🔧 Essential Commands

```bash
# Check current status
git status

# See what changed
git diff

# View commit history
git log --oneline -10

# See remotes
git remote -v

# Fetch without merging
git fetch upstream main

# See what will be pulled
git log HEAD..upstream/main --oneline
```

---

## 🚨 Conflict Resolution

```bash
# After pull shows conflicts:

# 1. See conflicted files
git status

# 2. Open files and edit (remove <<<<<<, ======, >>>>>> markers)

# 3. Mark as resolved
git add .

# 4. Complete merge
git commit -m "Resolved conflicts"
```

---

## 🛠️ Troubleshooting

### "Your local changes would be overwritten"
```bash
git add .
git commit -m "Save work"
# Then pull again
```

### "refusing to merge unrelated histories"
```bash
git pull upstream main --allow-unrelated-histories
```

### "Authentication failed"
Use Personal Access Token from GitHub Settings

### "upstream does not appear to be a git repository"
```bash
git remote add upstream https://github.com/UVineethaa/collegedata.git
```

---

## ✅ After Pulling

```bash
# Install new dependencies
cd backend && npm install
cd ../frontend && npm install

# Test application
cd backend && npm start
cd ../frontend && npm start
```

---

## 🎓 Best Practices

1. Always commit or stash before pulling
2. Pull frequently to avoid large conflicts
3. Test after pulling
4. Read commit messages: `git log --oneline -5`

---

## 📱 One-Click Solutions

- **pull-from-github.bat** - Commits and pulls automatically
- **pull-safely.bat** - Stashes, pulls, and restores changes

Just double-click these files!
