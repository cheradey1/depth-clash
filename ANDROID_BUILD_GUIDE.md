# 📱 Android Build Guide - Depth Clash

## Prerequisites

- ✅ Android Studio installed (3.6+)
- ✅ Android SDK (API 30+)
- ✅ Java Development Kit (JDK 11+)
- ✅ Capacitor fully configured (`capacitor.config.ts` ✅)
- ✅ Vite build optimized for Android (`vite.config.ts` ✅)

## Build Steps

### Step 1: Build Web Assets
```bash
npm run build:android
```
This command:
- Builds React/Vite to `dist/` folder
- Runs Vite in Android mode (loads `.env.android`)
- Syncs assets with Capacitor
- Opens Android Studio automatically

### Step 2: Android Studio Configuration
When Android Studio opens:
1. Wait for Gradle sync to complete
2. Ensure all dependencies are downloaded
3. Select emulator or real device from Device Manager
4. Build → Build Bundle(s)/APK(s) → Build APK(s)

### Step 3: APK Output Location
```
android/app/build/outputs/apk/
```

**Debug APK** (for testing):
```
android/app/build/outputs/apk/debug/app-debug.apk
```

**Release APK** (for distribution):
- Requires signing with keystore
- See _Signing the APK_ section below

## Environment Configuration

### Development (Local Machine)
- **File**: `.env`
- **Server**: `http://localhost:4000` (desktop backend)
- **Usage**: `npm run dev` for web testing

### Android (Emulator/Device)
- **File**: `.env.android`
- **Server**: `http://192.168.0.104:4000` (local network IP)
- **Note**: If IP changes, update `.env.android` and rebuild

### Network Access
The app needs to connect to WebSocket server on port 4000:
- ✅ INTERNET permission added in `AndroidManifest.xml`
- ✅ Mixed content allowed in `capacitor.config.ts`
- ✅ Local IP configured in `.env.android`

## Testing on Emulator

### Starting Emulator
```bash
# List available emulators
emulator -list-avds

# Launch emulator
emulator -avd Pixel_4_API_30 &
```

### Installing Debug APK
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### View Backend Logs
```bash
# From server directory
npm start
```

## Signing the APK (Release)

### Create Keystore
```bash
keytool -genkey -v -keystore depth-clash.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias depthclash
```

### Sign APK
```bash
jarsigner -verbose -sigalg SHA1withRSA \
  -digestalg SHA1 \
  -keystore depth-clash.keystore \
  android/app/build/outputs/apk/release/app-release-unsigned.apk \
  depthclash
```

### Align APK
```bash
zipalign -v 4 app-release-unsigned.apk app-release.apk
```

## Troubleshooting

### Issue: Gradle Sync Fails
**Solution**: 
- Android Studio → File → Sync Now
- Check JAVA_HOME environment variable
- Update Android SDK platforms

### Issue: App Can't Connect to Server
**Solution**:
- Verify server running on port 4000
- Check local IP in `.env.android` matches machine IP:
  ```bash
  hostname -I
  ```
- Update `.env.android` if needed:
  ```
  VITE_SERVER_URL=http://YOUR_IP:4000
  ```
- Rebuild: `npm run build:android`

### Issue: APK Won't Install
**Solution**:
- Check Android version compatibility (min API 30)
- Uninstall previous version: `adb uninstall com.depthclash.game`
- Reinstall: `adb install app-debug.apk`

### Issue: App Crashes on Start
**Solution**:
- Check Android logcat for errors:
  ```bash
  adb logcat
  ```
- Ensure `dist/` folder has all assets:
  ```bash
  ls -la dist/
  ```

## Architecture Overview

```
┌─────────────────────────────────────────┐
│      React App (TypeScript)              │
│   - Hexagonal Grid Game                  │
│   - Turn-based Combat                    │
│   - Socket.io Multiplayer                │
└────────────────┬────────────────────────┘
                 │ npm run build:android
                 ▼
         ┌──────────────────┐
         │   Vite Build     │
         │  (Optimization)  │
         └────────┬─────────┘
                  │
                  ▼
         ┌──────────────────┐
         │  dist/ → assets  │
         └────────┬─────────┘
                  │
                  ▼
        ┌────────────────────────┐
        │    Capacitor Sync      │
        │ (Android wrapper layer)│
        └────────┬───────────────┘
                 │
                 ▼
        ┌────────────────────────┐
        │  Android Studio Build  │
        │  (Gradle compilation)  │
        └────────┬───────────────┘
                 │
                 ▼
        ┌────────────────────────┐
        │   APK Generated        │
        │ (app-debug.apk)        │
        └────────────────────────┘
```

## Production Checklist

- [ ] Verify all dependencies installed
- [ ] Test build locally: `npm run build`
- [ ] Build Android: `npm run build:android`
- [ ] Run on emulator/device
- [ ] Test all game features
- [ ] Server running on port 4000
- [ ] Network access verified
- [ ] Version bumped in `build.gradle`
- [ ] APK signed with release keystore
- [ ] Upload to Google Play Store

## File Structure

```
/root
├── capacitor.config.ts          ✅ Config
├── vite.config.ts               ✅ Build settings
├── .env                          ✅ Local server URL
├── .env.android                  ✅ Android server URL
├── android/
│   ├── app/
│   │   ├── build.gradle          ✅ Version, signing
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml  ✅ Permissions
│   │   │   └── assets/
│   │   │       └── public/        ← Synced from dist/
│   │   └── build/outputs/apk/    ← Generated APK
│   └── build.gradle
├── src/                          ✅ Game code
├── dist/                         ← Generated by Vite
└── node_modules/
```

## Resources

- [Capacitor Documentation](https://capacitorjs.com/)
- [Android Studio Docs](https://developer.android.com/studio)
- [Vite Build Configuration](https://vitejs.dev/config/)
- [Depth Clash Game Logic](./PROJECT_STATUS.md)

---

**Status**: ✅ Ready for Android APK generation
**Last Updated**: Phase 9 (Capacitor Integration)
