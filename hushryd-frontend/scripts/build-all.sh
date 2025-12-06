#!/bin/bash

# Build All Script - Builds both Android and iOS apps
# This script orchestrates building both platforms

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_TYPE="${1:-release}"
BUILD_PROFILE="${2:-production}"

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   HushRyd - Build All Platforms${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Build Android
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Building Android (APK & AAB)${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
bash "$PROJECT_ROOT/scripts/build-android.sh" "$BUILD_TYPE" "apk"
bash "$PROJECT_ROOT/scripts/build-android.sh" "$BUILD_TYPE" "aab"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Building iOS (via EAS Build)${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
bash "$PROJECT_ROOT/scripts/build-ios.sh" "$BUILD_PROFILE" "ios"

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ All builds completed successfully!${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"

