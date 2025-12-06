#!/bin/bash

# Android Build Script for AWS Linux Server
# This script builds Android APK/AAB files for production deployment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$PROJECT_ROOT/android"
BUILD_TYPE="${1:-release}"  # release or debug
BUILD_VARIANT="${2:-apk}"   # apk or aab (App Bundle)
OUTPUT_DIR="$PROJECT_ROOT/builds/android"

echo -e "${GREEN}🚀 Starting Android Build Process${NC}"
echo "Project Root: $PROJECT_ROOT"
echo "Build Type: $BUILD_TYPE"
echo "Build Variant: $BUILD_VARIANT"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java is not installed. Please install Java JDK 17 or higher.${NC}"
    exit 1
fi

# Check Java version (need JDK 17+)
JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 17 ]; then
    echo -e "${RED}❌ Java version $JAVA_VERSION is too old. Please install JDK 17 or higher.${NC}"
    exit 1
fi

# Navigate to project root
cd "$PROJECT_ROOT"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing npm dependencies...${NC}"
    npm install
fi

# Setup configuration files
if [ -f "scripts/setup-config.sh" ]; then
    echo -e "${YELLOW}🔧 Setting up configuration files...${NC}"
    bash scripts/setup-config.sh
fi

# Prebuild Expo native code
echo -e "${YELLOW}🔨 Prebuilding Expo native code...${NC}"
npx expo prebuild --platform android --clean

# Navigate to Android directory
cd "$ANDROID_DIR"

# Clean previous builds
echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
./gradlew clean

# Build based on variant
if [ "$BUILD_VARIANT" == "aab" ]; then
    echo -e "${YELLOW}📦 Building Android App Bundle (AAB)...${NC}"
    ./gradlew bundle${BUILD_TYPE^}  # Capitalize first letter (release -> Release)
    
    # Find and copy AAB file
    AAB_FILE=$(find app/build/outputs/bundle/${BUILD_TYPE}Release -name "*.aab" | head -n 1)
    if [ -z "$AAB_FILE" ]; then
        echo -e "${RED}❌ AAB file not found!${NC}"
        exit 1
    fi
    
    mkdir -p "$OUTPUT_DIR"
    cp "$AAB_FILE" "$OUTPUT_DIR/app-${BUILD_TYPE}-$(date +%Y%m%d-%H%M%S).aab"
    echo -e "${GREEN}✅ AAB built successfully: $OUTPUT_DIR/app-${BUILD_TYPE}-$(date +%Y%m%d-%H%M%S).aab${NC}"
    
elif [ "$BUILD_VARIANT" == "apk" ]; then
    echo -e "${YELLOW}📦 Building Android APK...${NC}"
    ./gradlew assemble${BUILD_TYPE^}
    
    # Find and copy APK file
    APK_FILE=$(find app/build/outputs/apk/${BUILD_TYPE} -name "*.apk" | head -n 1)
    if [ -z "$APK_FILE" ]; then
        echo -e "${RED}❌ APK file not found!${NC}"
        exit 1
    fi
    
    mkdir -p "$OUTPUT_DIR"
    cp "$APK_FILE" "$OUTPUT_DIR/app-${BUILD_TYPE}-$(date +%Y%m%d-%H%M%S).apk"
    echo -e "${GREEN}✅ APK built successfully: $OUTPUT_DIR/app-${BUILD_TYPE}-$(date +%Y%m%d-%H%M%S).apk${NC}"
else
    echo -e "${RED}❌ Invalid build variant: $BUILD_VARIANT. Use 'apk' or 'aab'.${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Android build completed successfully!${NC}"
echo "Output directory: $OUTPUT_DIR"

