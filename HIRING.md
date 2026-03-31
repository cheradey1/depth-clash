# 🚀 We're Hiring: Senior Full-Stack Developer

## About Depth Clash

**Depth Clash** is an innovative turn-based strategy game featuring:
- 🎮 14×11 hexagonal grid for tactical gameplay
- 👥 Real-time multiplayer via WebSocket (Socket.io)
- 💎 In-game economy with tournaments
- 🏆 Global ranking system

**Current Status:** MVP complete, ready for production scaling

---

## 📋 What Needs to Be Built

### 1. **Online Battle - Real-time Optimization**
- Game state synchronization with fixed tickrate (60 TPS)
- Server-side anti-cheat logic
- Multi-player handshake (2+ players simultaneously)
- **Stack:** Node.js, Socket.io, PostgreSQL

### 2. **Currency & Economy System**
- Premium currency 💎 (gems) system
- Soft currency (coins) for in-game purchases
- Redis caching for performance
- Audit logging for all transactions
- **Stack:** Node.js, Redis, PostgreSQL

### 3. **Shop & Inventory**
- Interactive shop UI (React)
- Inventory management
- Subscription management
- **Stack:** React/TypeScript, Node.js API, PostgreSQL

### 4. **Withdrawal System (Payouts)**
- Payment integrations: PayPal, Stripe, Wise, PrivatBank
- KYC verification (documents, bank account)
- Automatic payout scheduling
- Compliance logging for regulations
- **Stack:** Node.js, Stripe/PayPal APIs, PostgreSQL

### 5. **Tournaments & Prize Distribution**
- Tournament creation & management
- Prize pool distribution algorithm
- Leaderboard API with real-time updates
- Match pairing algorithm (fair matching)
- **Stack:** Node.js, React, PostgreSQL, Redis

---

## 👨‍💻 Requirements

### ✅ Must Have
- **3+ years** commercial React + TypeScript experience
- **Real-time backend** (Socket.io, WebSocket, or similar)
- **SQL databases** (PostgreSQL, MySQL) - DDL/DML expertise
- **Payment gateways** (Stripe, PayPal experience)
- **Git + GitHub** (branch strategy, code reviews)
- English communication (client meetings)

### 🔶 Nice to Have
- Game development experience (any engine)
- System design (scalability, performance optimization)
- DevOps basics (Docker, CI/CD pipelines)
- Redis / caching strategies
- Compliance & financial regulations knowledge
- Anti-cheat / bot detection systems

### ❌ Not Required
- Mobile development experience
- Blockchain / Web3 background
- Machine Learning
- Cloud certifications

---

## 💰 Compensation

### Model: **25% Revenue Share + Co-founder Potential**

```
Tournament Income: $10,000
├─ Platform Operations: $1,200 (12%)
├─ Developer Pool (50%): $5,000
│  ├─ Lead Developer (25%): $2,500
│  └─ YOUR SHARE (25%): $1,250
│     (proportional to your git commits)
└─ Founder (38%): $3,800
```

**Guarantees:**
- 💵 Monthly payments via PayPal/Wise
- 📊 Transparent calculations (git contribution score)
- 🚀 Co-founder opportunity at $100k+ MRR milestone

**Year 1 Projection:**
```
Months 1-3: $0 (development)
Months 4-6: $400-1500/month (beta tournaments)
Months 7-12: $1500-5000+/month (public launch)
Expected Year 1: $8,000-18,000
```

**See [REVENUE_SHARING.md](./REVENUE_SHARING.md) for detailed breakdown**

---

## 📅 Project Timeline

| Phase | Duration | Deliverables |
|-------|----------|---------------|
| **Alpha** | 2 months | Online battles, shop system |
| **Beta** | 1 month | Payment processing integrated |
| **Launch** | 2 weeks | Public tournaments live |
| **Growth** | Ongoing | Analytics, leaderboards, API |

**Commitment:** 25-40 hours/week (flexible)

---

## 🛠️ Tech Stack

### Frontend
- React 19.0.0 + TypeScript 5.6
- Vite (build system)
- Socket.io Client
- Tailwind CSS
- Framer Motion (animations)

### Backend
- Node.js v20+
- Express.js
- Socket.io (real-time)
- PostgreSQL (primary DB) or MongoDB Atlas
- Redis (caching & sessions)

### Infrastructure
- Render.com (backend hosting)
- Vercel (frontend hosting)
- MongoDB Atlas or AWS RDS (database)

### Payment APIs
- Stripe (payment processing, subscriptions)
- PayPal (alternative payments)
- Wise (international payouts)

---

## 📊 Success Metrics

You earn more when:
- ✅ More players participate in tournaments (volume)
- ✅ Higher conversion rates (checkout optimization)
- ✅ Lower operational costs (code efficiency)
- ✅ System scales to 10k+ concurrent players

---

## 🔗 How to Apply

### 1. **Review the Codebase**
```bash
git clone https://github.com/cheradey1/depth-clash.git
cd depth-clash
npm install
npm run dev  # Frontend on localhost:3000

cd server && npm start  # Backend on localhost:4000
```

### 2. **Evaluate Architecture**
Study these key files:
- `src/hooks/useNetworkGameLogic.ts` - WebSocket state management
- `server/index.js` - Express + Socket.io setup
- `src/types.ts` - Game state definitions

### 3. **Submit Application**

Create GitHub Issue with title:
```
[HIRING] Application - Senior Developer [Your Name]
```

Include in the issue:
- 👤 Your name & GitHub profile link
- 🎯 3-4 relevant project links (portfolio)
- 💭 Your approach to solving tasks #1-5 (brief)
- ⏰ Availability (timezone, hours/week)
- 💬 Languages (English, Ukrainian, other)

### 4. **Interview Process**
1. Initial technical call (30 min)
2. Architecture discussion (1 hour)
3. Code sample review (async)
4. Compensation negotiation
5. Legal agreement signing

---

## 🤝 Working Arrangement

### Full-Time Arrangement
- ✅ 100% fully remote
- ✅ Timezone: UTC-3 to UTC+3 preferred
- ✅ Flexible hours (results matter)
- ✅ Vacation & time off (negotiable)
- ✅ Home office support

### Legal & IP
- 📜 Revenue Share Agreement (custom contract)
- 🔐 Your code stays MIT-licensed
- 📋 NDA for confidential financials
- ⚖️ Dispute resolution in Ukrainian law

### Communication
- 📍 Daily standup (15 min, async preferred)
- 🔄 Weekly technical sync
- 💬 Slack/Telegram for quick questions
- 📊 Monthly business review

---

## 🌟 Why Join This Project?

- 🎮 **Gaming Industry** - fastest growth sector in Ukraine
- 💰 **Significant Income** - 25% of multiplayer tournaments
- 🚀 **Co-founder Potential** - grow from contractor to partner
- 👥 **Small Team** - no corporate bullshit, fast decisions
- 🌍 **Global Audience** - game available worldwide
- 📈 **Scaling Story** - MVP to millions of users

---

## 📞 Contact

- **GitHub:** [cheradey1/depth-clash](https://github.com/cheradey1/depth-clash)
- **Apply via:** [GitHub Issues](https://github.com/cheradey1/depth-clash/issues)

---

## 📋 Additional Reading

- [Revenue Sharing Agreement](./REVENUE_SHARING.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Project Status](./PROJECT_STATUS.md)

---

**Ready to build something amazing? Let's go! 🚀**

*Last Updated: March 31, 2026*
