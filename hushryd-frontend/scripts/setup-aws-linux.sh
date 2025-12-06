#!/bin/bash

# AWS Linux Server Setup Script
# This script sets up the build environment on AWS Linux servers

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   HushRyd - AWS Linux Setup${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Detect Linux distribution
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo -e "${RED}❌ Cannot detect Linux distribution${NC}"
    exit 1
fi

echo -e "${GREEN}Detected OS: $OS${NC}"
echo ""

# Function to install on Amazon Linux 2 / RHEL / CentOS
install_amazon_linux() {
    echo -e "${YELLOW}📦 Installing packages for Amazon Linux/RHEL/CentOS...${NC}"
    
    # Update system
    sudo yum update -y
    
    # Install Node.js 18
    if ! command -v node &> /dev/null; then
        echo -e "${YELLOW}Installing Node.js...${NC}"
        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
        sudo yum install -y nodejs
    else
        echo -e "${GREEN}✅ Node.js already installed: $(node --version)${NC}"
    fi
    
    # Install Java JDK 17
    if ! command -v java &> /dev/null; then
        echo -e "${YELLOW}Installing Java JDK 17...${NC}"
        sudo yum install -y java-17-amazon-corretto-devel
    else
        echo -e "${GREEN}✅ Java already installed: $(java -version 2>&1 | head -n 1)${NC}"
    fi
    
    # Install build tools
    sudo yum install -y unzip wget git
    
    # Install AWS CLI v2
    if ! command -v aws &> /dev/null; then
        echo -e "${YELLOW}Installing AWS CLI...${NC}"
        curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
        unzip awscliv2.zip
        sudo ./aws/install
        rm -rf aws awscliv2.zip
    else
        echo -e "${GREEN}✅ AWS CLI already installed: $(aws --version)${NC}"
    fi
}

# Function to install on Ubuntu/Debian
install_ubuntu() {
    echo -e "${YELLOW}📦 Installing packages for Ubuntu/Debian...${NC}"
    
    # Update system
    sudo apt-get update -y
    sudo apt-get upgrade -y
    
    # Install Node.js 18
    if ! command -v node &> /dev/null; then
        echo -e "${YELLOW}Installing Node.js...${NC}"
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        echo -e "${GREEN}✅ Node.js already installed: $(node --version)${NC}"
    fi
    
    # Install Java JDK 17
    if ! command -v java &> /dev/null; then
        echo -e "${YELLOW}Installing Java JDK 17...${NC}"
        sudo apt-get install -y openjdk-17-jdk
    else
        echo -e "${GREEN}✅ Java already installed: $(java -version 2>&1 | head -n 1)${NC}"
    fi
    
    # Install build tools
    sudo apt-get install -y unzip wget git
    
    # Install AWS CLI v2
    if ! command -v aws &> /dev/null; then
        echo -e "${YELLOW}Installing AWS CLI...${NC}"
        curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
        unzip awscliv2.zip
        sudo ./aws/install
        rm -rf aws awscliv2.zip
    else
        echo -e "${GREEN}✅ AWS CLI already installed: $(aws --version)${NC}"
    fi
}

# Install based on OS
case $OS in
    amzn|rhel|centos)
        install_amazon_linux
        ;;
    ubuntu|debian)
        install_ubuntu
        ;;
    *)
        echo -e "${RED}❌ Unsupported OS: $OS${NC}"
        echo "Please install manually:"
        echo "  - Node.js 18+"
        echo "  - Java JDK 17+"
        echo "  - AWS CLI v2"
        exit 1
        ;;
esac

# Setup Android SDK
echo ""
echo -e "${YELLOW}📱 Setting up Android SDK...${NC}"

ANDROID_HOME="/opt/android-sdk"
if [ ! -d "$ANDROID_HOME" ]; then
    echo -e "${YELLOW}Installing Android SDK...${NC}"
    sudo mkdir -p "$ANDROID_HOME"
    cd /tmp
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip
    sudo unzip -q commandlinetools-linux-9477386_latest.zip -d "$ANDROID_HOME"
    sudo mkdir -p "$ANDROID_HOME/cmdline-tools"
    sudo mv "$ANDROID_HOME/cmdline-tools" "$ANDROID_HOME/cmdline-tools/latest"
    rm commandlinetools-linux-9477386_latest.zip
    
    # Set permissions
    sudo chown -R $USER:$USER "$ANDROID_HOME"
else
    echo -e "${GREEN}✅ Android SDK already installed${NC}"
fi

# Add Android SDK to PATH
if ! grep -q "ANDROID_HOME" ~/.bashrc; then
    echo "" >> ~/.bashrc
    echo "# Android SDK" >> ~/.bashrc
    echo "export ANDROID_HOME=$ANDROID_HOME" >> ~/.bashrc
    echo "export PATH=\$PATH:\$ANDROID_HOME/cmdline-tools/latest/bin:\$ANDROID_HOME/platform-tools" >> ~/.bashrc
fi

export ANDROID_HOME=$ANDROID_HOME
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

# Install Android SDK components
echo -e "${YELLOW}Installing Android SDK components (this may take a while)...${NC}"
yes | sdkmanager --licenses > /dev/null 2>&1 || true
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" > /dev/null 2>&1

# Install EAS CLI
echo ""
echo -e "${YELLOW}📦 Installing EAS CLI...${NC}"
if ! command -v eas &> /dev/null; then
    npm install -g eas-cli
    echo -e "${GREEN}✅ EAS CLI installed${NC}"
else
    echo -e "${GREEN}✅ EAS CLI already installed: $(eas --version)${NC}"
fi

# Create builds directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
mkdir -p "$PROJECT_ROOT/builds/android"
mkdir -p "$PROJECT_ROOT/builds/ios"

# Make scripts executable
chmod +x "$PROJECT_ROOT/scripts"/*.sh

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Setup completed successfully!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""
echo "1. Configure AWS credentials:"
echo "   aws configure"
echo ""
echo "2. Login to Expo (for iOS builds):"
echo "   eas login"
echo ""
echo "3. Build Android APK:"
echo "   cd hushryd-frontend"
echo "   npm run build:android:apk"
echo ""
echo "4. Build Android AAB (for Play Store):"
echo "   npm run build:android:aab"
echo ""
echo "5. Build iOS (via EAS):"
echo "   npm run build:ios"
echo ""
echo "6. Deploy to AWS S3:"
echo "   npm run deploy:aws"
echo ""
echo -e "${YELLOW}⚠️  Note: You may need to restart your shell or run:${NC}"
echo "   source ~/.bashrc"
echo ""

