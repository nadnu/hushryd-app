#!/bin/bash

# AWS Deployment Script
# This script helps deploy built artifacts to AWS S3 or other storage

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILDS_DIR="$PROJECT_ROOT/builds"
S3_BUCKET="${AWS_S3_BUCKET:-hushryd-builds}"
S3_REGION="${AWS_REGION:-us-east-1}"
VERSION="${APP_VERSION:-$(date +%Y%m%d-%H%M%S)}"

echo -e "${GREEN}🚀 Starting AWS Deployment${NC}"
echo "S3 Bucket: $S3_BUCKET"
echo "Region: $S3_REGION"
echo "Version: $VERSION"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed.${NC}"
    echo "Install it with: pip install awscli"
    echo "Or: curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip'"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured.${NC}"
    echo "Run: aws configure"
    exit 1
fi

# Create builds directory if it doesn't exist
mkdir -p "$BUILDS_DIR/android"
mkdir -p "$BUILDS_DIR/ios"

# Function to upload to S3
upload_to_s3() {
    local file_path=$1
    local s3_path=$2
    
    if [ -f "$file_path" ]; then
        echo -e "${YELLOW}📤 Uploading $file_path to s3://$S3_BUCKET/$s3_path${NC}"
        aws s3 cp "$file_path" "s3://$S3_BUCKET/$s3_path" --region "$S3_REGION"
        echo -e "${GREEN}✅ Uploaded successfully${NC}"
        
        # Generate presigned URL (valid for 7 days)
        PRESIGNED_URL=$(aws s3 presign "s3://$S3_BUCKET/$s3_path" --expires-in 604800 --region "$S3_REGION")
        echo -e "${BLUE}🔗 Download URL (7 days): $PRESIGNED_URL${NC}"
    else
        echo -e "${RED}❌ File not found: $file_path${NC}"
    fi
}

# Upload Android builds
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Uploading Android Builds${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Find latest APK
LATEST_APK=$(ls -t "$BUILDS_DIR/android"/*.apk 2>/dev/null | head -n 1)
if [ -n "$LATEST_APK" ]; then
    APK_NAME=$(basename "$LATEST_APK")
    upload_to_s3 "$LATEST_APK" "android/$VERSION/$APK_NAME"
    upload_to_s3 "$LATEST_APK" "android/latest/app.apk"
fi

# Find latest AAB
LATEST_AAB=$(ls -t "$BUILDS_DIR/android"/*.aab 2>/dev/null | head -n 1)
if [ -n "$LATEST_AAB" ]; then
    AAB_NAME=$(basename "$LATEST_AAB")
    upload_to_s3 "$LATEST_AAB" "android/$VERSION/$AAB_NAME"
    upload_to_s3 "$LATEST_AAB" "android/latest/app.aab"
fi

# Upload iOS builds (if downloaded from EAS)
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Uploading iOS Builds${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Find latest IPA
LATEST_IPA=$(ls -t "$BUILDS_DIR/ios"/*.ipa 2>/dev/null | head -n 1)
if [ -n "$LATEST_IPA" ]; then
    IPA_NAME=$(basename "$LATEST_IPA")
    upload_to_s3 "$LATEST_IPA" "ios/$VERSION/$IPA_NAME"
    upload_to_s3 "$LATEST_IPA" "ios/latest/app.ipa"
fi

# Create deployment manifest
MANIFEST_FILE="$BUILDS_DIR/deployment-$VERSION.json"
cat > "$MANIFEST_FILE" << EOF
{
  "version": "$VERSION",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "android": {
    "apk": "$(basename $LATEST_APK 2>/dev/null || echo '')",
    "aab": "$(basename $LATEST_AAB 2>/dev/null || echo '')"
  },
  "ios": {
    "ipa": "$(basename $LATEST_IPA 2>/dev/null || echo '')"
  },
  "s3_bucket": "$S3_BUCKET",
  "s3_region": "$S3_REGION"
}
EOF

upload_to_s3 "$MANIFEST_FILE" "manifests/deployment-$VERSION.json"
upload_to_s3 "$MANIFEST_FILE" "manifests/latest.json"

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Deployment Summary:${NC}"
echo "Version: $VERSION"
echo "S3 Bucket: s3://$S3_BUCKET"
echo "Manifest: s3://$S3_BUCKET/manifests/deployment-$VERSION.json"

