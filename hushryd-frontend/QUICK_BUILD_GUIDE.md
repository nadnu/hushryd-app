# Quick Build Guide for AWS Linux

## Quick Start

### 1. Setup AWS Linux Server (One-time)

```bash
# Run the setup script
cd hushryd-frontend
bash scripts/setup-aws-linux.sh

# Configure AWS credentials
aws configure

# Login to Expo (for iOS builds)
eas login
```

### 2. Build Commands

#### Android APK (for direct installation)
```bash
npm run build:android:apk
```

#### Android AAB (for Google Play Store)
```bash
npm run build:android:aab
```

#### iOS (via EAS Build - cloud)
```bash
npm run build:ios
```

#### Build Everything
```bash
npm run build:all
```

#### Deploy to AWS S3
```bash
# Set environment variables first
export AWS_S3_BUCKET=your-bucket-name
export AWS_REGION=us-east-1

# Deploy
npm run deploy:aws
```

## File Locations

- **Android APK/AAB**: `builds/android/`
- **iOS IPA**: `builds/ios/` (after downloading from EAS)
- **Build Scripts**: `scripts/`

## Environment Variables

```bash
# AWS Configuration
export AWS_S3_BUCKET=hushryd-builds
export AWS_REGION=us-east-1
export APP_VERSION=1.0.0

# Android Configuration
export ANDROID_HOME=/opt/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools
```

## Troubleshooting

**Can't find Node.js/Java?**
- Run: `bash scripts/setup-aws-linux.sh`

**Android build fails?**
- Check: `echo $ANDROID_HOME`
- Verify: `sdkmanager --list`

**iOS build fails?**
- Check: `eas whoami`
- Verify: `eas build:list`

**AWS deployment fails?**
- Check: `aws sts get-caller-identity`
- Verify bucket exists: `aws s3 ls s3://your-bucket-name`

For detailed documentation, see [BUILD_DEPLOYMENT.md](./BUILD_DEPLOYMENT.md)

