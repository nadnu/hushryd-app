#!/bin/bash

# iOS Build Script for AWS Linux Server using EAS Build
# Note: iOS builds require macOS/Xcode, so we use Expo Application Services (EAS) for cloud builds

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_PROFILE="${1:-production}"  # production, preview, or development
PLATFORM="${2:-ios}"              # ios or all

echo -e "${GREEN}🚀 Starting iOS Build Process with EAS Build${NC}"
echo "Project Root: $PROJECT_ROOT"
echo "Build Profile: $BUILD_PROFILE"
echo "Platform: $PLATFORM"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo -e "${YELLOW}📦 Installing EAS CLI...${NC}"
    npm install -g eas-cli
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

# Check if user is logged in to EAS
echo -e "${BLUE}🔐 Checking EAS authentication...${NC}"
if ! eas whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to EAS. Please login:${NC}"
    echo "Run: eas login"
    echo "Or set up credentials:"
    echo "1. Create an Expo account at https://expo.dev"
    echo "2. Run: eas login"
    exit 1
fi

# Show current EAS user
EAS_USER=$(eas whoami)
echo -e "${GREEN}✅ Logged in as: $EAS_USER${NC}"

# Build options
BUILD_OPTIONS="--profile $BUILD_PROFILE --platform $PLATFORM --non-interactive"

# Check if we want to submit to App Store
if [ "$BUILD_PROFILE" == "production" ]; then
    echo -e "${BLUE}📱 Production build will be created${NC}"
    echo -e "${YELLOW}💡 Tip: After build completes, you can submit to App Store with:${NC}"
    echo "   eas submit --platform ios --latest"
fi

# Start the build
echo -e "${GREEN}🏗️  Starting EAS Build...${NC}"
echo "This will build in the cloud and may take 10-20 minutes."
echo ""

eas build $BUILD_OPTIONS

echo -e "${GREEN}🎉 iOS build process completed!${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Check build status: eas build:list"
echo "2. Download build: eas build:download --platform ios --latest"
echo "3. Submit to App Store: eas submit --platform ios --latest"

