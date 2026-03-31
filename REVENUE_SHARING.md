# Revenue Sharing Agreement - Depth Clash

## For Contributors & Developers

Depth Clash використовує **revenue sharing model** щоб нагородити розробників пропорційно до їх внесків.

---

## 🎯 How It Works

### Revenue Pool Calculation

```
Tournament Income: 100%
├─ Platform Operations (12%): Server costs, marketing, support
├─ Developer Rewards (50%): Distributed to all contributors
│  └─ Founder/Lead (25%): Project lead compensation
│  └─ Contributors (25%): Split based on git contribution score
└─ Founder (38%): Business development, legal, operations
```

### Example Calculation

**Tournament:** $10,000 from entry fees

```
$10,000 (Total Income)
├─ Operations: $1,200 (servers, payments fees)
├─ Developers: $5,000
│  ├─ Lead dev: $2,500 (50% of dev pool)
│  ├─ Your share: $2,500 × [your % of commits]
│  └─ Other devs: remaining
└─ Founder: $3,800 (business, growth)
```

**If you have 25% of commits:** $2,500 × 0.25 = **$625**

---

## 💰 Payment Distribution

### Calculation Basis

```
Your Payment = (Dev Pool × Your Contribution Score) / 100
```

**Contribution Score:**
```
Your Score = (Your Commits / Total Commits) × 100%
```

**Measured by:**
- ✅ Git commits (public `git shortlog -sn`)
- ✅ PR reviews & approvals  
- ✅ Bug fixes & features
- ✅ Documentation contributions

### Payment Schedule

- **Frequency:** Monthly (after tournament closes)
- **Minimum Threshold:** $50 USD (smaller amounts accumulate)
- **Payment Method:** PayPal, Wise, or bank transfer
- **Currency:** USD
- **Timing:** Within 30 days of tournament end

### Example Annual Earnings

```
Month 1-3: $0 (development phase)
Month 4-6: $300-800/month (testing tournaments)
Month 7-9: $1,200-2,500/month (launch phase)
Month 10-12: $2,500-5,000+/month (growth phase)

Estimated annual (Year 1): $6,000-12,000
Potential (Year 2+): $30,000-100,000+ at scale
```

---

## 👥 Eligibility

### You Qualify If:
- ✅ Your code is merged to `main` branch
- ✅ Your GitHub account is linked to your real identity
- ✅ You have signed the Contributor License Agreement (CLA)
- ✅ You've contributed in last 90 days (for active status)

### You Don't Qualify If:
- ❌ Code is not merged (draft/rejected PR)
- ❌ Contributions were before project launch
- ❌ Your commit was unauthorized/stolen

---

## 📋 How to Claim Your Share

### Step 1: Contribute Code
```bash
git clone https://github.com/cheradey1/depth-clash.git
cd depth-clash
# Make changes, test, commit
git push origin your-branch
# Create PR on GitHub
```

### Step 2: Get PR Approved
- Code review by maintainers
- Tests pass (CI/CD)
- PR merged to `main`

### Step 3: Register for Payments
- GitHub username: recorded automatically
- Payment details: submit via form
- KYC verification: if > $600/year

### Step 4: Receive Monthly Payments
- Calculate distribution after each tournament
- Transfer via PayPal/Wise automatically
- Monthly statement provided

---

## 🔒 Important Terms

### Intellectual Property
- Your code is licensed under **MIT License**
- You retain authorship & copyright
- Depth Clash gets perpetual license to use & distribute
- You can use your code in other projects

### Confidentiality
- Non-public financial data is confidential
- Don't disclose other devs' earnings
- Don't share unreleased features

### Disputes Resolution
- Calculation disputes: 30-day appeal period
- Payment disputes: escalate to founder
- Legal jurisdiction: Ukrainian law applies

### Termination
- You can withdraw anytime (no notice needed)
- Project can terminate program (90-day notice)
- Unpaid balances are still owed

---

## 📊 Transparency & Audits

Every distribution is public:
- Tournament gross revenue (public)
- Developer pool total (public)
- Individual payments (private, only to recipient)
- Commit percentages (public on GitHub)

**Monthly Report:**
```markdown
## April 2026 Distribution

Tournament Income: $15,250
Developer Rewards: $7,625

Contributor Payouts:
- Alice (42% commits): $3,202.50 ✅
- Bob (35% commits): $2,668.75 ✅
- Charlie (23% commits): $1,753.75 ✅

Paid on: May 5, 2026
```

---

## ⚠️ Special Cases

### Multiple Contributors per Feature
Commit count is weighted equally. If Alice & Bob worked together:
- Alice: 10 commits = 50%
- Bob: 10 commits = 50%
- Both receive equal share

### Bug Fixes vs Features
All commits are weighted equally (no point system).

### Third-Party Code
Code from Stack Overflow, open-source libraries, etc:
- Must be properly attributed
- Must include original license
- Contribution score reduced if mostly copy-paste

---

## 🚀 Future Scaling

As Depth Clash grows:

```
Year 1: $50,000 tournament revenue
├─ Dev Pool: $25,000
├─ You get (if 30% commits): $7,500

Year 2: $500,000 tournament revenue  
├─ Dev Pool: $250,000
├─ You get (if 25% commits): $62,500

Year 3: $5,000,000 tournament revenue
├─ Dev Pool: $2,500,000
├─ You get (if 20% commits): $500,000
```

---

## ✅ To Get Started

1. **Read this agreement** ← You are here
2. **[Sign CLA](./CONTRIBUTING.md)** - via GitHub PR
3. **Start contributing** - make PRs, get merged
4. **Wait for tournaments** - play-test phase or paying tournaments
5. **Claim earnings** - submit payment details once merged

---

## 📞 Questions?

- GitHub Issues: [depth-clash/issues](https://github.com/cheradey1/depth-clash/issues)
- Email maintainers via GitHub
- See [CONTRIBUTING.md](./CONTRIBUTING.md) for code guidelines

---

**Last Updated:** March 31, 2026  
**Agreement Version:** 1.0  
**Status:** Active
