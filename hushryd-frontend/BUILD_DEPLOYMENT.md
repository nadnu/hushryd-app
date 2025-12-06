# Build and Deployment Guide for AWS Linux Server

This guide explains how to build Android and iOS apps for deployment on AWS Linux servers.

## Prerequisites

### For Android Builds (Can run on Linux)
- **Node.js** (v18 or higher)
- **Java JDK 17** or higher
- **Android SDK** (via Android Studio or command line tools)
- **Gradle** (included with Android project)

### For iOS Builds (Requires EAS Build - Cloud-based)
- **Node.js** (v18 or higher)
- **Expo Account** (free at https://expo.dev)
- **EAS CLI** (installed automatically by scripts)

### For AWS Deployment
- **AWS CLI** configured with credentials
- **S3 Bucket** for storing builds

## Setup Instructions

### 1. Install Prerequisites on AWS Linux Server

```bash
# Update system
sudo yum update -y  # For Amazon Linux 2
# or
sudo apt-get update && sudo apt-get upgrade -y  # For Ubuntu/Debian

# Install Node.js (using NodeSource)
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install Java JDK 17
sudo yum install -y java-17-amazon-corretto-devel
# or for Ubuntu
sudo apt-get install -y openjdk-17-jdk

# Install Android SDK Command Line Tools
cd /opt
sudo wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip
sudo unzip commandlinetools-linux-9477386_latest.zip
sudo mkdir -p android-sdk/cmdline-tools
sudo mv cmdline-tools android-sdk/cmdline-tools/latest

# Set environment variables
export ANDROID_HOME=/opt/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

# Install required Android SDK components
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
sdkmanager --licenses  # Accept all licenses

# Add to ~/.bashrc or ~/.bash_profile
echo 'export ANDROID_HOME=/opt/android-sdk' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools' >> ~/.bashrc
```

### 2. Install AWS CLI

```bash
# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials
aws configure
```

### 3. Setup Expo/EAS Account

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS project (if not already done)
cd hushryd-frontend
eas build:configure
```

## Build Commands

### Android Builds

#### Build APK (for direct installation)
```bash
cd hushryd-frontend
bash scripts/build-android.sh release apk
```

#### Build AAB (for Google Play Store)
```bash
cd hushryd-frontend
bash scripts/build-android.sh release aab
```

#### Build Debug APK
```bash
bash scripts/build-android.sh debug apk
```

**Output Location:** `hushryd-frontend/builds/android/`

### iOS Builds

iOS builds use EAS Build (Expo's cloud build service) since iOS requires macOS/Xcode.

#### Production Build
```bash
cd hushryd-frontend
bash scripts/build-ios.sh production ios
```

#### Preview Build (for TestFlight)
```bash
bash scripts/build-ios.sh preview ios
```

#### Development Build
```bash
bash scripts/build-ios.sh development ios
```

**Note:** After the build completes, download it with:
```bash
eas build:download --platform ios --latest
```

### Build Both Platforms

```bash
cd hushryd-frontend
bash scripts/build-all.sh release production
```

## Deployment to AWS S3

### 1. Configure Environment Variables

```bash
export AWS_S3_BUCKET=your-builds-bucket-name
export AWS_REGION=us-east-1
export APP_VERSION=1.0.0
```

### 2. Deploy Builds

```bash
cd hushryd-frontend
bash scripts/deploy-aws.sh
```

This will:
- Upload Android APK and AAB files to S3
- Upload iOS IPA files (if downloaded)
- Create deployment manifests
- Generate presigned download URLs (valid for 7 days)

### 3. S3 Bucket Structure

```
s3://your-bucket/
├── android/
│   ├── 1.0.0/
│   │   ├── app-release-20240101-120000.apk
│   │   └── app-release-20240101-120000.aab
│   └── latest/
│       ├── app.apk
│       └── app.aab
├── ios/
│   ├── 1.0.0/
│   │   └── app-production-20240101-120000.ipa
│   └── latest/
│       └── app.ipa
└── manifests/
    ├── deployment-1.0.0.json
    └── latest.json
```

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/build.yml`:

```yaml
name: Build and Deploy

on:
  push:
    tags:
      - 'v*'

jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - uses: actions/setup-java@v3
        with:
          distribution: 'corretto'
          java-version: '17'
      - name: Setup Android SDK
        uses: android-actions/setup-android@v2
      - name: Install dependencies
        run: |
          cd hushryd-frontend
          npm install
      - name: Build Android
        run: |
          cd hushryd-frontend
          bash scripts/build-android.sh release aab
      - name: Deploy to S3
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_S3_BUCKET: ${{ secrets.AWS_S3_BUCKET }}
        run: |
          cd hushryd-frontend
          bash scripts/deploy-aws.sh

  build-ios:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install EAS CLI
        run: npm install -g eas-cli
      - name: Login to EAS
        run: eas login --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
      - name: Build iOS
        run: |
          cd hushryd-frontend
          bash scripts/build-ios.sh production ios
```

## Signing Configuration

### Android Signing

For production builds, you need to configure signing:

1. Generate a keystore:
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore hushryd-release.keystore \
  -alias hushryd-key -keyalg RSA -keysize 2048 -validity 10000
```

2. Create `android/keystore.properties`:
```properties
storePassword=your-store-password
keyPassword=your-key-password
keyAlias=hushryd-key
storeFile=../hushryd-release.keystore
```

3. Update `android/app/build.gradle` to use the keystore for release builds.

### iOS Signing

iOS signing is handled automatically by EAS Build. You'll need to:
1. Add your Apple Developer account to EAS
2. Configure certificates in EAS (automatic or manual)

## Troubleshooting

### Android Build Issues

**Issue: Gradle build fails**
- Ensure Java JDK 17+ is installed
- Check `ANDROID_HOME` environment variable
- Verify Android SDK components are installed

**Issue: Out of memory**
- Increase Gradle memory: `export GRADLE_OPTS="-Xmx2048m"`

### iOS Build Issues

**Issue: EAS build fails**
- Check Expo account is logged in: `eas whoami`
- Verify `eas.json` configuration
- Check Apple Developer account is linked

**Issue: Cannot download build**
- Ensure you're logged in: `eas login`
- Check build status: `eas build:list`

### AWS Deployment Issues

**Issue: AWS credentials not found**
- Run `aws configure`
- Or set environment variables: `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

**Issue: S3 upload fails**
- Verify bucket exists and you have write permissions
- Check IAM policy allows S3 PutObject

## Security Best Practices

1. **Never commit keystores or signing keys** to version control
2. **Use environment variables** for sensitive configuration
3. **Store signing keys** in AWS Secrets Manager or similar
4. **Use IAM roles** instead of access keys when possible
5. **Enable S3 bucket encryption** for build artifacts
6. **Set appropriate S3 bucket policies** to restrict access

## Additional Resources

- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [React Native Android Build Guide](https://reactnative.dev/docs/signed-apk-android)
- [AWS CLI Documentation](https://docs.aws.amazon.com/cli/)
- [Android SDK Command Line Tools](https://developer.android.com/studio/command-line)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Expo/EAS build logs
3. Check Android Gradle build logs in `android/build-error.log`

