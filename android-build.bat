@echo off
REM Depth Clash Android Build Helper Script for Windows
REM This script automates the Android build and deployment process

setlocal enabledelayedexpansion

REM Configuration
set PROJECT_NAME=Depth Clash
set PACKAGE_NAME=com.depthclash.game
set APK_DEBUG=android\app\build\outputs\apk\debug\app-debug.apk
set APK_RELEASE=android\app\build\outputs\apk\release\app-release-unsigned.apk

REM Check if command provided
if "%1"=="" (
    set COMMAND=full
) else (
    set COMMAND=%1
)

REM Main switch
if /i "%COMMAND%"=="build" (
    call :build_web
    goto :end
)
if /i "%COMMAND%"=="check" (
    call :check_prerequisites
    goto :end
)
if /i "%COMMAND%"=="devices" (
    call :list_devices
    goto :end
)
if /i "%COMMAND%"=="apk" (
    call :check_apk
    goto :end
)
if /i "%COMMAND%"=="install" (
    call :install_apk
    goto :end
)
if /i "%COMMAND%"=="launch" (
    call :launch_app
    goto :end
)
if /i "%COMMAND%"=="logs" (
    call :view_logs
    goto :end
)
if /i "%COMMAND%"=="full" (
    call :full_build_and_install
    goto :end
)
if /i "%COMMAND%"=="help" (
    call :show_help
    goto :end
)

echo Unknown command: %COMMAND%
call :show_help
exit /b 1

:check_prerequisites
    echo.
    echo ===============================================
    echo Checking Prerequisites
    echo ===============================================
    echo.
    
    where node >nul 2>nul
    if errorlevel 1 (
        echo [ERROR] Node.js not found
        exit /b 1
    )
    node --version | findstr /R "v[0-9]" >nul
    echo [OK] Node.js found: !ERRORLEVEL!
    
    where npm >nul 2>nul
    if errorlevel 1 (
        echo [ERROR] npm not found
        exit /b 1
    )
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo [OK] npm found: !NPM_VERSION!
    
    where adb >nul 2>nul
    if errorlevel 1 (
        echo [WARNING] Android SDK (adb) not found
        echo Make sure Android Studio is installed
    ) else (
        echo [OK] Android SDK found (adb)
    )
    
    if exist "android\gradlew.bat" (
        echo [OK] Gradle wrapper found
    ) else (
        echo [WARNING] Gradle wrapper not found
    )
    
    echo.
    exit /b 0

:build_web
    echo.
    echo ===============================================
    echo Building Web Assets
    echo ===============================================
    echo.
    
    if not exist "package.json" (
        echo [ERROR] package.json not found
        exit /b 1
    )
    
    call npm run build:android
    if errorlevel 1 (
        echo [ERROR] Build failed
        exit /b 1
    )
    
    if exist "dist" (
        echo [OK] Web assets built to dist/
    ) else (
        echo [ERROR] dist/ directory not created
        exit /b 1
    )
    
    echo.
    exit /b 0

:check_apk
    echo.
    echo ===============================================
    echo Checking APK
    echo ===============================================
    echo.
    
    if exist "%APK_DEBUG%" (
        for %%A in (%APK_DEBUG%) do (
            set APK_SIZE=%%~zA
        )
        echo [OK] APK found: %APK_DEBUG%
        echo [INFO] APK Size: !APK_SIZE! bytes
    ) else (
        echo [ERROR] APK not found at %APK_DEBUG%
        echo [INFO] APK must be built in Android Studio first
        exit /b 1
    )
    
    echo.
    exit /b 0

:list_devices
    echo.
    echo ===============================================
    echo Connected Devices
    echo ===============================================
    echo.
    
    where adb >nul 2>nul
    if errorlevel 1 (
        echo [ERROR] adb not found
        exit /b 1
    )
    
    adb devices
    echo.
    exit /b 0

:install_apk
    echo.
    echo ===============================================
    echo Installing APK
    echo ===============================================
    echo.
    
    where adb >nul 2>nul
    if errorlevel 1 (
        echo [ERROR] adb not found
        exit /b 1
    )
    
    if not exist "%APK_DEBUG%" (
        echo [ERROR] APK not found
        exit /b 1
    )
    
    echo [INFO] Uninstalling previous version...
    adb uninstall %PACKAGE_NAME% >nul 2>&1
    
    echo [INFO] Installing APK...
    adb install "%APK_DEBUG%"
    if errorlevel 1 (
        echo [ERROR] Failed to install APK
        exit /b 1
    )
    
    echo [OK] APK installed successfully
    echo.
    exit /b 0

:launch_app
    echo.
    echo ===============================================
    echo Launching App
    echo ===============================================
    echo.
    
    where adb >nul 2>nul
    if errorlevel 1 (
        echo [ERROR] adb not found
        exit /b 1
    )
    
    adb shell am start -n %PACKAGE_NAME%/%PACKAGE_NAME%.MainActivity
    if errorlevel 1 (
        echo [ERROR] Failed to launch app
        exit /b 1
    )
    
    echo [OK] App launched
    echo [INFO] View logs: adb logcat
    echo.
    exit /b 0

:view_logs
    echo.
    echo ===============================================
    echo App Logs (Press Ctrl+C to exit)
    echo ===============================================
    echo.
    
    where adb >nul 2>nul
    if errorlevel 1 (
        echo [ERROR] adb not found
        exit /b 1
    )
    
    adb logcat
    exit /b 0

:full_build_and_install
    echo.
    echo ===============================================
    echo Full Build and Install Pipeline
    echo ===============================================
    echo.
    
    call :check_prerequisites
    call :build_web
    call :list_devices
    call :check_apk
    echo [INFO] APK built! Now install and launch with "android-build.bat install" and "android-build.bat launch"
    echo.
    exit /b 0

:show_help
    echo.
    echo Depth Clash Android Build Helper
    echo.
    echo Usage: android-build.bat [command]
    echo.
    echo Commands:
    echo   build       Build web assets and prepare for Android
    echo   check       Check prerequisites
    echo   devices     List connected devices
    echo   apk         Check if APK exists and show size
    echo   install     Install APK on connected device
    echo   launch      Launch app on connected device
    echo   logs        View app logs in real-time
    echo   full        Full build and check pipeline [default]
    echo   help        Show this help message
    echo.
    echo Examples:
    echo   android-build.bat build      - Build web assets
    echo   android-build.bat full       - Complete build and install
    echo   android-build.bat devices    - List connected Android devices
    echo   android-build.bat logs       - View app logs
    echo.
    echo Environment:
    echo   .env        - Local server URL (desktop)
    echo   .env.android - Android server URL (emulator/device)
    echo.
    echo For more details, see: ANDROID_BUILD_GUIDE.md
    echo.
    exit /b 0

:end
exit /b 0
