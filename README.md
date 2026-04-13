<img width="1152" height="912" alt="Gemini_Generated_Image_gqbu6qgqbu6qgqbu" src="https://github.com/user-attachments/assets/f86eb955-45e6-4d0b-b28b-8a045895da48" />
<img width="1595" height="686" alt="Знімок екрана з 2026-04-05 16-22-14" src="https://github.com/user-attachments/assets/683d0ff5-0c19-46b9-bd64-50048ea787ac" />
<img width="788" height="548" alt="Знімок екрана з 2026-04-05 18-02-56" src="https://github.com/user-attachments/assets/01a1c6d2-1dbd-4d4c-83a0-f0501e066aae" /> 
<img width="1598" height="642" alt="Знімок екрана з 2026-04-13 16-22-43" src="https://github.com/user-attachments/assets/ce07d3a2-2aee-4862-8b00-06e20b93d47c" />
<img width="1598" height="642" alt="Знімок екрана з 2026-04-13 16-22-14" src="https://github.com/user-attachments/assets/b1a398e0-d22d-4769-b74f-726ab79ad1dd" />


# ⚔️ Depth Clash - Hexagonal Strategy Game

A turn-based submarine warfare game with hexagonal grid strategy gameplay, real-time multiplayer via Socket.io, and AI opponent support. Built with React, TypeScript, Vite, and wrapped for Android with Capacitor.

## 🎮 Features

- **Hexagonal Grid Combat**: 14×11 grid with 154 playable hexes
- **Turn-Based Strategy**: 30-second setup phase, real-time battle phase
- **12 Ships Per Player**: Position and command your submarine fleet
- **Multiplayer via WebSocket**: Real-time PvP matches with Socket.io
- **AI Opponent**: Challenge the AI in Training mode
- **Mobile Ready**: Packaged as Android APK via Capacitor
- **Clash Royale Styling**: 3D effects, animations, and polish
- **Persistent Economy**: Server-side balance, premium ship inventory, and purchase flow
- **Matchmaking & Tournaments**: Queue-based multiplayer match pairing with asset locking
- **Responsive UI**: Works on 320px to 2560px+ screens

## 🚀 Quick Start (Web)

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm run dev

# Build for production
npm run build
```

### Environment Setup
Create `.env` file in root:
```
VITE_SERVER_URL=http://localhost:4000
```

### Run Backend Server
```bash
cd server
npm install
npm start
# Server runs on port 4000
```

## 📱 Android Build & Deployment

### Prerequisites
- Android Studio 3.6+
- Android SDK API 30+
- JDK 11+

### Quick Build
```bash
# Linux/Mac
./android-build.sh build      # Build web assets
./android-build.sh full       # Full pipeline

# Windows
android-build.bat build       # Build web assets
android-build.bat full        # Full pipeline
```

### Step-by-Step Android Deployment

1. **Build Web Assets**
   ```bash
   npm run build:android
   ```
   This loads `.env.android` with the Android server URL.

2. **Open in Android Studio**
   The command above will automatically open Android Studio with the Android project.

3. **Build APK**
   - Select emulator or device
   - Build → Build Bundle(s)/APK(s) → Build APK(s)

4. **Install on Device**
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

5. **Launch**
   ```bash
   adb shell am start -n com.depthclash.game/com.depthclash.game.MainActivity
   ```

### Android Network Configuration

The Android build automatically uses `.env.android` with:
- **Server URL**: `http://192.168.0.104:4000` (local network IP)
- **Purpose**: Allows Android emulator/device to connect to backend server
- **Update if needed**: Edit `.env.android` if your machine's IP changes:
  ```bash
  hostname -I    # Get your IP
  # Update .env.android with new IP, then rebuild
  ```

## ✅ Що зроблено

Проект "Depth Clash" реалізує повноцінну гру в жанрі стратегії з підводними човнами на шестикутній сітці. Основні досягнення включають:

- **Ігрова логіка**: Реалізовано ходи гравців, позиціонування кораблів, бойові дії з анімаціями вибухів та снарядів.
- **Мережева гра**: Підтримка багатокористувацької гри через WebSocket (Socket.io) з лобі для пошуку матчів.
- **ШІ-суперник**: Режим тренування з комп'ютерним опонентом.
- **Графічний інтерфейс**: React-компоненти для ігрового поля (HexTile), кораблів (Ship), ефектів бою (CombatEffects), лобі (OnlineGameLobby), магазину (ShopPanel) та підручника (Tutorial).
- **Серверна частина**: Node.js сервер для обробки з'єднань, авторитетної логіки бою, збереження економіки та матчмейкінгу.
- **Економічна платформа**: Серверне збереження балансу, преміум-кораблів, покупок та турнірного бронювання.
- **Мобільна адаптація**: Інтеграція з Capacitor для збірки Android APK.
- **Активи**: Графічні ресурси для кораблів, вибухів, снарядів та звуків.
- **Збірка та деплоймент**: Скрипти для автоматичної збірки веб-активів та Android додатку.

## 📂 Що є в проекті

Структура проекту включає наступні основні папки та файли:

- **src/**: Вихідний код веб-додатку
  - `App.tsx`: Головний компонент додатку
  - `main.tsx`: Точка входу React
  - `components/`: Компоненти інтерфейсу (CombatEffects, HexTile, OnlineGameLobby, Ship, ShopPanel, Tutorial)
  - `hooks/`: Хуки для логіки гри (useGameLogic, useNetworkGameLogic)
  - `utils/`: Утилітарні функції (hexUtils)
  - `assets/`: Графічні ресурси (explosions, projectiles, ships)
- **server/**: Серверна частина на Node.js
  - `index.js`: Основний серверний файл
  - `package.json`: Залежності сервера
- **android/**: Android-проект для Capacitor
  - `app/`: Android-додаток з маніфестом, ресурсами та Java-кодом
  - Gradle-файли для збірки
- **public/**: Публічні активи (ships, sounds)
- **Конфігураційні файли**: `package.json`, `vite.config.ts`, `capacitor.config.ts`, `tsconfig.json`
- **Документація**: `GETTING_STARTED.md`, `PROJECT_STATUS.md`, `PHASE_9_SUMMARY.md` та інші

### Troubleshooting Android Build

| Issue | Solution |
|-------|----------|
| Gradle sync fails | File → Sync Now in Android Studio |
| App won't connect to server | Check `VITE_SERVER_URL` in `.env.android`, verify IP: `hostname -I` |
| APK won't install | Uninstall first: `adb uninstall com.depthclash.game` |
| App crashes on start | Check logcat: `adb logcat` |

## 📁 Project Structure

```
depth-clash/
├── src/
│   ├── App.tsx                 # Main game orchestrator
│   ├── components/
│   │   ├── HexTile.tsx        # Hexagon grid rendering
│   │   ├── Ship.tsx           # Ship component
│   │   ├── CombatEffects.tsx  # Visual effects
│   │   └── OnlineGameLobby.tsx # Multiplayer UI
│   ├── hooks/
│   │   ├── useGameLogic.ts    # Local game state
│   │   └── useNetworkGameLogic.ts # WebSocket logic
│   ├── utils/
│   │   └── hexUtils.ts        # Hex math utilities
│   └── types.ts               # TypeScript definitions
├── server/
│   └── index.js               # Socket.io backend
├── android/                   # Capacitor Android project
├── vite.config.ts            # Build configuration
├── capacitor.config.ts       # Capacitor configuration
├── .env                      # Local development server URL
├── .env.android              # Android server URL
├── package.json              # Dependencies
├── ANDROID_BUILD_GUIDE.md    # Detailed build guide
├── PROJECT_STATUS.md         # Development status
└── README.md                 # This file
```

## 🛠 Available Scripts

### Web Development
```bash
npm run dev              # Start dev server (port 3000)
npm run build            # Build for production
npm run preview          # Preview production build
npm run build:android    # Build for Android + sync Capacitor
npm run lint             # Run TypeScript checks
```

### Android Development
```bash
npm run android:open     # Open Android project in Android Studio
npm run android:build    # Build and open Android project
```

### Server
```bash
cd server
npm start                # Start backend server (port 4000)
npm run dev              # Start with nodemon
```

## 💾 Technology Stack

### Frontend
- **React** 19.0.0 with TypeScript 5.6.3
- **Vite** 6.4.1 for fast builds
- **Tailwind CSS** 4.1.14 for styling
- **Framer Motion** 12.23.24 for animations
- **Socket.io Client** 4.6.1 for multiplayer
- **Lucide React** for icons
- **Capacitor** 7.6.0 for Android wrapping

### Backend
- **Node.js** v20+
- **Express** 4.18.2
- **Socket.io** 4.6.1
- **CORS** 2.8.5

## 📊 Game Mechanics

- **Grid**: 14 columns × 11 rows = 154 hexagons (45px size)
- **Ships**: 12 per player
- **Setup Phase**: 30 seconds
- **Turn Duration**: Real-time updates via WebSocket
- **Fog of War**: Ships hidden until within vision range
- **Combat**: Damage calculation based on distance

## � Economy Model: "Ships as Currency"

Depth Clash operates on a **Real-Asset Economy** model where in-game units (submarines/ships) have direct monetary value and limited quantity.

### Core Economic Loop

**1. Acquisition**
- Players purchase **Premium Ships** in the shop ($1.50 per unit)
- Earn free ships through AI training (limited quantity per day)
- Win ships from defeated opponents in tournaments

**2. Staking (Risk)**
- Tournament entry requires **12-ship stake** (high barrier of entry)
- Server **locks ships** on player account during match (prevents double-spending)
- Failed tournament run = loss of all 12 ships to opponent

**3. Battle Outcomes**
- **Victory**: Opponent's 12 ships transfer to your inventory
- **Defeat**: Your 12 ships deducted from balance and awarded to winner

**4. Liquidation**
- Players can **sell accumulated ships** back to shop at market rate ($1.00 per unit)
- **Withdraw funds** via PayPal/Stripe integration
- Incentivizes competitive play for real earnings

### 💰 Store Income (Per Ship Sale)

```
Ship Price: $1.50
│
├─ Shop Cut: $0.50
│  ├─ Developer Share: 25% → $0.125 per ship ✅
│  └─ Platform Share: 75% → $0.375 per ship
│
└─ Remaining to Project: $1.00 per ship
```

**Revenue Model Examples:**

**Per 12 Ships Purchased (1 Tournament Entry):**
```
Player pays: 12 × $1.50 = $18.00
Shop cuts: 12 × $0.50 = $6.00
  ├─ Developer: 12 × $0.125 = $1.50 ✅
  ├─ Platform: 12 × $0.375 = $4.50
  └─ Project: 12 × $1.00 = $12.00
```

**Per 10 Active Players (Monthly):**
```
Estimated revenue: 10 players × 12 ships × $1.50 = $180.00
Developer income: 10 × 12 × $0.125 = $15.00/month ✅
```

**Per 100 Active Players (Scaling):**
```
Total revenue: 100 × 12 × $1.50 = $1,800.00/month
Developer income: 100 × 12 × $0.125 = $150.00/month ✅
```

**Incentive for Developers:** The more tournaments players enter (and ships purchased), the higher your income. At scale (1000+ players), developer income reaches **$1,500+/month** with 25% shop revenue share.

### Technical Implementation

**Server-Side Authority**
- ✅ All balance changes through **ACID database transactions** (PostgreSQL/MongoDB)
- ✅ Client has **zero access** to balance (prevents cheating)
- ✅ Every action validated on Node.js backend: ship count checks, payment validation, transaction logging

**Anti-Fraud Measures**
- 🔒 Atomic transactions prevent asset duplication
- 📝 Every transaction logged with unique `tx_id` for audit trail
- 🚫 Replay attack prevention via nonce-based requests
- ⏱️ Transaction timeout = failure (no hanging states)

**Asset Locking During Match**
```
User Balance: 50 ships
↓ [Enters Tournament with 12-ship stake]
↓ [Server locks 12 ships]
Spendable: 38 ships
↓ [Match resolves: Win/Loss]
↓ [Ships released or transferred to opponent]
[New balance: 62 ships (victory) OR 38 ships (defeat)]
```

### 🎓 Free Training vs Paid Gameplay

**Free Training** (AI Battles)
- 🤖 Play unlimited matches against AI opponent
- 📍 Earn **free ships daily** (limited quantity, resets every 24h)
- 💰 No cost, no risk — perfect for learning game mechanics
- 🏆 Victory/defeat does NOT affect balance
- ⏰ Daily cap: 5 free ships/day from AI wins

**Paid Ranked Battles** (Player vs Player)
- 💎 Each match requires **12-ship stake** from your inventory
- 📊 Ships act as **transaction currency** — value depends on quantity purchased
- ⚠️ **Risk model**: Full stake (12 ships) transfers to winner if you lose
- 💸 **Example**: 
  - Buy 50 ships → Have 50 ships to stake across 4 tournaments (12 each)
  - Win 1st match → Get opponent's 12 ships (now 62 total)
  - Lose 2nd match → Lose your 12 ships to opponent (down to 50)
  - Remaining 26 ships can still enter 2 more tournaments
- 🎯 **Incentive**: Accumulate ships by winning, sell back to shop for real money

**Tournament Flow**
```
Total Inventory: 50 ships
↓ [Enter Tournament]
↓ [Allocate 12 ships for stake]
↓ [12 locked, 38 available for other matches]
↓ [Win] → +12 opponent ships = 62 total
  OR
↓ [Lose] → -12 ships = 38 total (removed from circulation)
```

---

## �📝 Build Status

- ✅ Web: Fully functional (port 3000)
- ✅ Backend: Running on port 4000
- ✅ Android: Ready for APK generation
- ✅ TypeScript: Zero errors
- ✅ Build Size: 423.11 KB (web), optimized for mobile

## 🤝 Contributing & Hiring

### 🚀 We're Hiring!
Senior Full-Stack Developer needed for production scaling:
- **Revenue Share:** 25% of tournament income
- **Responsibilities:** Online battles, payment integration, tournaments
- **Tech Stack:** React, TypeScript, Node.js, PostgreSQL

👉 **[SEE HIRING.md](./HIRING.md)** for full details

### 👨‍💻 Contributing
Want to contribute to Depth Clash?
- **[Contributing Guidelines](./CONTRIBUTING.md)** - How to submit PRs
- **[Revenue Sharing Agreement](./REVENUE_SHARING.md)** - How contributors get paid (25% of revenue)

### 📜 Legal
- **[LICENSE](./LICENSE)** - MIT License
- **[REVENUE_SHARING.md](./REVENUE_SHARING.md)** - Distribution of earnings

---

## 🔗 Documentation

### Quick Start
- [GETTING_STARTED.md](./GETTING_STARTED.md) - Local development
- [ANDROID_BUILD_GUIDE.md](./ANDROID_BUILD_GUIDE.md) - Android APK building
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Development history

### External References
- [Capacitor Docs](https://capacitorjs.com/)
- [Vite Documentation](https://vitejs.dev/)
- [Socket.io Guide](https://socket.io/docs/v4/)

## � Production Deployment

### Quick Deploy (5 Steps)

**1. MongoDB Atlas (Database)**
- Visit atlas.mongodb.com → Create M0 cluster
- IP Whitelist: 0.0.0.0/0
- Get URI: `mongodb+srv://<your_db_username>:<your_db_password>

**2. Render (Backend)**
- Connect GitHub → Create Web Service
- Build: `cd server && npm install`
- Start: `node index.js`
- Env: `MONGODB_URI=<your-uri>`
- Result: `https://depth-clash-server.onrender.com`

**3. Vercel (Frontend)**
- Connect GitHub → Import project
- Build: `npm run build`
- Env: `VITE_SERVER_URL=https://depth-clash-server.onrender.com`
- Result: `https://depth-clash.vercel.app`

**4. Itch.io (Web Build)**
- Build: `VITE_SERVER_URL=... npm run build`
- Upload `dist/` folder
- Publish as HTML5 game

---

## 👨‍💻 Development

### Adding Features
1. Update game logic in `src/hooks/useGameLogic.ts`
2. Add UI components in `src/components/`
3. Update Socket.io handlers in `src/hooks/useNetworkGameLogic.ts`
4. Test: `npm run dev`
5. Build: `npm run build`
6. Submit PR per [CONTRIBUTING.md](./CONTRIBUTING.md)

### Debugging
- **Web**: Open DevTools (F12)
- **Android**: `adb logcat`
- **Backend**: Server logs in terminal

## 📄 License

[MIT License](./LICENSE) - Free to use, modify, distribute

## 🙏 Credits

Developed as a turn-based hexagonal strategy game with multiplayer support.

Thanks to all [contributors](https://github.com/cheradey1/depth-clash/graphs/contributors)!

---

## 📊 Status

- ✅ MVP: Complete
- ✅ Web: Production-ready
- ✅ Backend: Scalable
- ✅ Android: Ready for APK
- ✅ TypeScript: Zero errors
- 🚀 Hiring: Senior Developer (25% revenue share)
- 📈 Deployment: GitHub → MongoDB Atlas → Render → Vercel → Itch.io

**Last Updated**: March 31, 2026
