#!/bin/bash

# Depth Clash Android Build Helper Script
# This script automates the Android build and deployment process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="Depth Clash"
PACKAGE_NAME="com.depthclash.game"
APK_DEBUG="android/app/build/outputs/apk/debug/app-debug.apk"
APK_RELEASE="android/app/build/outputs/apk/release/app-release-unsigned.apk"

# Functions
print_header() {
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found"
        exit 1
    fi
    print_success "Node.js found: $(node --version)"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm not found"
        exit 1
    fi
    print_success "npm found: $(npm --version)"
    
    # Check if Android SDK is available
    if ! command -v adb &> /dev/null; then
        print_warning "Android SDK (adb) not in PATH"
        print_info "Make sure Android Studio is installed and SDK path is configured"
    else
        print_success "Android SDK found (adb)"
    fi
    
    # Check if gradle wrapper exists
    if [ -f "android/gradlew" ]; then
        print_success "Gradle wrapper found"
    else
        print_warning "Gradle wrapper not found - will be used from Android Studio"
    fi
    
    echo ""
}

# Build web assets
build_web() {
    print_header "Building Web Assets"
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found"
        exit 1
    fi
    
    npm run build:android
    
    if [ -d "dist" ]; then
        print_success "Web assets built to dist/"
        echo "  Files: $(find dist -type f | wc -l) files"
    else
        print_error "dist/ directory not created"
        exit 1
    fi
    
    echo ""
}

# Check if APK exists
check_apk() {
    if [ -f "$APK_DEBUG" ]; then
        print_success "APK found: $APK_DEBUG"
        APK_SIZE=$(du -h "$APK_DEBUG" | cut -f1)
        print_info "APK Size: $APK_SIZE"
    else
        print_error "APK not found at $APK_DEBUG"
        print_info "APK must be built in Android Studio first"
        return 1
    fi
}

# List connected devices
list_devices() {
    print_header "Connected Devices"
    
    if ! command -v adb &> /dev/null; then
        print_error "adb not found - cannot list devices"
        return 1
    fi
    
    DEVICES=$(adb devices | grep -E "device$|emulator" | cut -f1)
    
    if [ -z "$DEVICES" ]; then
        print_warning "No devices or emulators connected"
        return 1
    fi
    
    print_success "Found devices:"
    echo "$DEVICES" | nl
    echo ""
}

# Install APK on device
install_apk() {
    if ! command -v adb &> /dev/null; then
        print_error "adb not found - cannot install APK"
        return 1
    fi
    
    if [ ! -f "$APK_DEBUG" ]; then
        print_error "APK not found"
        return 1
    fi
    
    print_header "Installing APK"
    
    # Uninstall previous version
    print_info "Uninstalling previous version..."
    adb uninstall $PACKAGE_NAME 2>/dev/null || true
    
    # Install new version
    print_info "Installing APK..."
    adb install "$APK_DEBUG"
    
    if [ $? -eq 0 ]; then
        print_success "APK installed successfully"
    else
        print_error "Failed to install APK"
        return 1
    fi
    
    echo ""
}

# Launch app
launch_app() {
    if ! command -v adb &> /dev/null; then
        print_error "adb not found"
        return 1
    fi
    
    print_header "Launching App"
    adb shell am start -n $PACKAGE_NAME/$PACKAGE_NAME.MainActivity
    
    if [ $? -eq 0 ]; then
        print_success "App launched"
        print_info "View logs: adb logcat"
    else
        print_error "Failed to launch app"
        return 1
    fi
    
    echo ""
}

# View logs
view_logs() {
    if ! command -v adb &> /dev/null; then
        print_error "adb not found"
        return 1
    fi
    
    print_header "App Logs (Press Ctrl+C to exit)"
    echo ""
    adb logcat
}

# Full build and install
full_build_and_install() {
    print_header "Full Build and Install Pipeline"
    
    check_prerequisites
    build_web
    list_devices || true
    check_apk || print_warning "You need to build APK in Android Studio first"
    install_apk || true
    launch_app || true
}

# Show help
show_help() {
    cat << EOF
${BLUE}Depth Clash Android Build Helper${NC}

Usage: $0 [command]

Commands:
    build           Build web assets and prepare for Android
    check           Check prerequisites
    devices         List connected devices
    apk             Check if APK exists and show size
    install         Install APK on connected device
    launch          Launch app on connected device
    logs            View app logs in real-time
    full            Full build, install, and launch pipeline (default)
    help            Show this help message

Examples:
    $0 build              # Build web assets
    $0 full               # Complete build and install
    $0 devices            # List connected Android devices
    $0 logs               # View app logs

Environment:
    ${YELLOW}.env${NC}          - Local server URL (desktop)
    ${YELLOW}.env.android${NC}    - Android server URL (emulator/device)
    
    Current Android server: $(cat .env.android | grep VITE_SERVER_URL)

For more details, see: ANDROID_BUILD_GUIDE.md

EOF
}

# Main script
main() {
    local command="${1:-full}"
    
    case "$command" in
        build)
            check_prerequisites
            build_web
            ;;
        check)
            check_prerequisites
            ;;
        devices)
            list_devices
            ;;
        apk)
            check_apk
            ;;
        install)
            install_apk
            ;;
        launch)
            launch_app
            ;;
        logs)
            view_logs
            ;;
        full)
            full_build_and_install
            ;;
        help|-h|--help)
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
