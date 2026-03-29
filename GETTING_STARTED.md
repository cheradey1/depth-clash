# 🚀 Getting Started - Depth Clash Android

## ONE COMMAND TO BUILD 📱

```bash
npm run build:android
```

That's it! This single command will:
1. ✅ Build your React game with Vite
2. ✅ Optimize for Android
3. ✅ Sync with Capacitor
4. ✅ Open Android Studio automatically

---

## What Happens Next

### In Android Studio (Auto-Opens)

1. **Wait for Gradle Sync** (1-2 minutes)
   - Android Studio will sync project automatically
   - All dependencies will be downloaded

2. **Select Device** 
   - Choose an emulator from Device Manager OR
   - Connect a physical Android phone

3. **Build APK**
   - Click: **Build** → **Build Bundle(s)/APK(s)** → **Build APK(s)**
   - Wait for build to complete

4. **Find Your APK**
   - Location: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Test Your APK

### Install on Emulator/Device
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Launch the Game
```bash
adb shell am start -n com.depthclash.game/com.depthclash.game.MainActivity
```

### View Logs (Debug Issues)
```bash
adb logcat | grep -i "depth"
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Gradle sync failed" | Open Android Studio → File → Sync Now |
| "App can't connect to server" | Check .env.android has your IP: `hostname -I` |
| "APK won't install" | `adb uninstall com.depthclash.game` then retry |
| "App crashes" | Run `adb logcat` to see error logs |

---

## Backend Server

Your game needs the backend running:

```bash
cd server
npm start
# Server runs on port 4000
```

---

## What's Been Done ✅

- ✅ React + Vite game configured  
- ✅ Capacitor framework integrated
- ✅ Android platform added
- ✅ Build pipeline created
- ✅ Environment configured
- ✅ Documentation written
- ✅ Helper tools provided

**Nothing is broken. Your game logic is 100% intact.**

---

## Full Documentation

- 📖 **QUICKSTART_ANDROID.md** - This guide (5 min)
- 📖 **ANDROID_BUILD_GUIDE.md** - Detailed guide (20 min)
- 📖 **README.md** - Project overview (15 min)
- 📖 **CAPACITOR_INTEGRATION.md** - Technical details (10 min)

---

## Development Tips

### Keep Multiple Terminals Open

**Terminal 1** - Web Development (Fast Testing)
```bash
npm run dev
```

**Terminal 2** - Backend Server
```bash
cd server && npm start
```

**Terminal 3** - Build & Deploy Commands
```bash
npm run build:android
```

### Workflow
1. Test changes locally with `npm run dev`
2. Run backend with `npm start`
3. When ready for Android, run `npm run build:android`
4. Build APK in Android Studio
5. Install and test on device

---

## Quick Commands Reference

```bash
# Web Development
npm run dev                     # Start dev server
npm run build                   # Production build
npm run preview                 # Preview prod build

# Android
npm run build:android           # Build + open Android Studio ⭐
npm run android:open            # Just open Android Studio
npm run android:build           # Alias for build:android

# Server
cd server && npm start          # Run backend

# Testing
adb devices                     # List devices
adb install app-debug.apk       # Install APK
adb logcat                      # View logs
```

---

## File Locations

```
Project Root
├── src/                       # Game code
├── server/                    # Backend
├── android/                   # Android project (Gradle)
│   └── app/build/outputs/apk/debug/
│       └── app-debug.apk      # ← Your APK is here
├── dist/                      # Web build output
├── .env                       # Web server URL
├── .env.android               # Android server URL
└── capacitor.config.ts        # Capacitor config
```

---

## Next Steps

### Now
```bash
npm run build:android
```

### Then (in Android Studio)
- Select device
- Build APK

### Finally
- Test on device
- Share with friends!

---

## Support

If you have issues:
1. Check `QUICKSTART_ANDROID.md` (5 min)
2. Read `ANDROID_BUILD_GUIDE.md` (20 min)
3. View `adb logcat` for errors
4. Check `.env.android` has correct server IP

---

## ✨ You're All Set!

Your Depth Clash game is ready for Android. Just one command to get started:

```bash
npm run build:android
```

Enjoy! 🎮📱
