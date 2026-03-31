# Contributing to Depth Clash

Thank you for your interest in contributing! 🎉

## 📖 Code of Conduct

Be respectful, inclusive, and constructive. No harassment, discrimination, or toxic behavior.

## 🚀 Getting Started

### 1. Fork & Clone
```bash
git clone https://github.com/YOUR_USERNAME/depth-clash.git
cd depth-clash
npm install
```

### 2. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
# or bugfix/issue-description
```

### 3. Make Changes
```bash
# Make your changes
# Test locally
npm run dev  # Frontend
cd server && npm start  # Backend
```

### 4. Commit & Push
```bash
git add .
git commit -m "feat: description of changes"
git push origin feature/your-feature-name
```

### 5. Create Pull Request
- Clear title: `feat: add leaderboard API` or `fix: WebSocket reconnection bug`
- Describe what & why in the PR description
- Link related issues: `Fixes #123`

---

## 📋 PR Requirements

Your PR should:
- ✅ Follow the code style (ESLint/Prettier)
- ✅ Include tests for new features
- ✅ Update documentation if needed
- ✅ Pass all CI checks
- ✅ No unrelated changes

---

## 💡 Areas to Contribute

### High Priority
- 🔴 Bug fixes (crashes, sync issues)
- 🟠 Performance optimizations (WebSocket throttling)
- 🟡 API improvements (new endpoints)

### Medium Priority
- 🟢 UI/UX enhancements
- 🔵 Documentation
- 🟣 Testing & test coverage

### Low Priority
- 🤎 Code style cleanups
- 🖤 Refactoring without behavior change

---

## 🏗️ Project Structure

```
depth-clash/
├── src/                 # React components
│   ├── components/      # Game UI components
│   ├── hooks/          # Game logic hooks
│   ├── utils/          # Utility functions
│   └── types.ts        # TypeScript definitions
├── server/             # Node.js backend
│   ├── index.js        # Express + Socket.io
│   ├── db.js           # Database setup
│   └── routes/         # API endpoints
├── android/            # Capacitor Android
└── public/             # Static assets
```

---

## 💻 Development Commands

```bash
# Install dependencies
npm install
cd server && npm install

# Start frontend dev server (port 3000)
npm run dev

# Start backend server (port 4000)
cd server && npm start

# Build production bundle
npm run build

# Type checking
npm run lint

# Build for Android
npm run build:android
```

---

## 🧪 Testing

before submitting PR:

```bash
# Test locally
npm run dev

# Check for errors
npm run lint

# Test specific feature
# (manual testing required for game mechanics)
```

---

## 📝 Commit Message Format

Use conventional commits:

```
feat: add new feature
fix: fix a bug
docs: update documentation
style: code style changes
refactor: refactor code (no behavior change)
perf: performance improvement
test: add/update tests
chore: maintenance tasks
```

Example:
```bash
git commit -m "feat: add tournament leaderboard API endpoint"
```

---

## 💰 Revenue Sharing

- Contributors get **25% of tournament revenue**
- Distributed proportionally to git commits
- See [REVENUE_SHARING.md](./REVENUE_SHARING.md) for details

Your contributions directly impact project success → Your income!

---

## 🐛 Reporting Bugs

### Good Bug Report Includes:
1. Clear title: `WebSocket connection drops on mobile`
2. Steps to reproduce
3. Expected vs actual behavior
4. Screenshots/videos if applicable
5. System info (browser, OS, device)

### Example:
```markdown
## Bug: Game freezes after 5 minutes online

### Steps to Reproduce:
1. Start online match
2. Wait 5 minutes
3. Observe game freeze

### Expected:
Game continues smoothly

### Actual:
Game becomes unresponsive, need hard refresh

### Environment:
- Browser: Chrome 120
- Device: iPhone 14
- OS: iOS 17.3
```

---

## 💡 Feature Requests

Include:
1. **Problem:** What pain point are you solving?
2. **Proposal:** How should it work?
3. **Benefits:** Why is this important?

Example:
```markdown
## Feature: Spectate Mode

### Problem:
Players can't watch other matches in real-time

### Proposal:
Add spectate button that lets players watch ongoing tournaments without playing

### Benefits:
- Increases engagement for offline players
- Helps learning from strong players
- Builds community
```

---

## 🔄 Review Process

### What Maintainers Check:
- ✅ Code quality & style
- ✅ Tests added & passing
- ✅ No breaking changes
- ✅ Documentation updated
- ✅ Git history is clean

### Your Checklist:
- [ ] Tests pass (`npm run lint`)
- [ ] Changes are focused (no scope creep)
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] No console.error or debug code left

---

## 🎓 Learning Resources

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Socket.io Guide](https://socket.io/docs/v4/socket-io-protocol/)
- [Express Tutorials](https://expressjs.com/en/starter/basic-routing.html)

---

## ❓ Questions?

- Check [README.md](./README.md)
- Search existing issues
- Create a GitHub Discussion
- Message maintainers

---

## 🙏 Thank You!

Every contribution makes Depth Clash better. We appreciate you! 🎮

**Last Updated:** March 31, 2026
