# 🚀 Quick Start - Android Deployment

## ⚡ TL;DR (30 seconds)

```bash
# 1. Install Android Studio (if not done)
# 2. Set PATH to Android SDK and JDK
# 3. Run in project root:
npm run build:android
```

Android Studio will open automatically with the project ready to build APK.

---

## 📱 Step-by-Step (5 minutes)

### Prerequisites ✅ (Do Once)
- [ ] Install [Android Studio](https://developer.android.com/studio)
- [ ] Android SDK API 30+
- [ ] Java Development Kit (JDK 11+)

### Build APK (One Command)

```bash
npm run build:android
```

**What this does**:
1. Builds React/Vite to `dist/`
2. Syncs with Capacitor
3. Opens Android Studio
4. Android project is ready to build

### In Android Studio

1. Wait for **Gradle sync** to complete (1-2 minutes)
2. Select **Emulator** or **Real Device** from Device Manager
3. Click **Build** → **Build Bundle(s)/APK(s)** → **Build APK(s)**
4. APK ready at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Test APK

```bash
# Install on device/emulator
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Launch app
adb shell am start -n com.depthclash.game/com.depthclash.game.MainActivity

# View logs if issues
adb logcat
```

---

## 🔧 Helper Commands

### Using Build Script (Linux/Mac)
```bash
./android-build.sh build       # Build web assets
./android-build.sh devices     # List connected devices
./android-build.sh install     # Install APK (requires built APK)
./android-build.sh launch      # Launch app
./android-build.sh logs        # View app logs
```

### Using Build Script (Windows)
```bat
android-build.bat build        # Build web assets
android-build.bat devices      # List connected devices
android-build.bat install      # Install APK  
android-build.bat launch       # Launch app
android-build.bat logs         # View app logs
```

---

## 📌 Key Configuration

### Automatic (Already Done ✅)
- ✅ Capacitor initialized with app ID: `com.depthclash.game`
- ✅ Android platform added
- ✅ Web assets build pipeline configured
- ✅ Environment setup: `.env.android`

### Server Connection
- **Local PC**: `VITE_SERVER_URL=http://localhost:4000`
- **Android**: `VITE_SERVER_URL=http://192.168.0.104:4000`

Backend server should be running:
```bash
cd server
npm start  # Runs on port 4000
```

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| "Gradle sync failed" | `File → Sync Now` in Android Studio |
| "terser not found" | Already fixed: `npm install --save-dev terser` ✅ |
| "App won't connect to server" | Check IP: `hostname -I`, update `.env.android` if needed |
| "APK install fails" | `adb uninstall com.depthclash.game` then retry |
| "App crashes on start" | Run `adb logcat` to see error logs |

---

## 📚 Documentation

- [ANDROID_BUILD_GUIDE.md](./ANDROID_BUILD_GUIDE.md) - Comprehensive guide
- [CAPACITOR_INTEGRATION.md](./CAPACITOR_INTEGRATION.md) - Technical details
- [README.md](./README.md) - Project overview
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Development history

---

## 🎯 What's Included

✅ **Web Game** - Full React/Vite game (3000+)
✅ **Backend Server** - Socket.io multiplayer (4000)
✅ **Android Wrapper** - Capacitor integration complete
✅ **Build Scripts** - Automated pipeline with helper tools
✅ **Documentation** - Guides for all platforms
✅ **Environment Config** - Server URLs configured
✅ **Game Logic** - Preserved intact, no changes

---

## ✨ Next Steps After APK

1. **Test on Device**
   - Install APK
   - Test all game features
   - Verify multiplayer via WebSocket

2. **Sign for Release** (if publishing)
   - Create keystore
   - Sign APK
   - Generate AAB for Play Store

3. **Submit to Play Store**
   - Create Google Play Developer account
   - Prepare app listing
   - Upload AAB

---

## 💡 Pro Tips

- **Fast Development**: Keep `npm run dev` running in separate terminal for web testing
- **Quick Android Build**: Reuse AVD: `emulator -avd Pixel_4_API_30 &`
- **View Logs Real-time**: `adb logcat | grep -i "MY_TAG"`
- **Debug Network**: Network tab in Chrome DevTools shows Socket.io events

---

## 📞 Quick Reference

```bash
# Development
npm run dev                    # Web dev server
npm start                      # Start backend
adb logcat                     # Android logs

# Building
npm run build                  # Prod web build
npm run build:android          # Android build + sync
npm run android:open           # Open in Android Studio

# Deployment
adb install <APK>             # Install on device
adb shell am start -n ...     # Launch app
adb uninstall com.depthclash.game  # Uninstall app
```

---

**Status**: ✅ Ready to Build APK
**Next Command**: `npm run build:android`

Enjoy deploying! 🎮
