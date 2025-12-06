# Android Build Script for Windows/AWS Windows Server
# This script builds Android APK/AAB files for production deployment

param(
    [string]$BuildType = "release",  # release or debug
    [string]$BuildVariant = "apk"    # apk or aab (App Bundle)
)

$ErrorActionPreference = "Stop"

# Configuration
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$AndroidDir = Join-Path $ProjectRoot "android"
$OutputDir = Join-Path $ProjectRoot "builds\android"

Write-Host "🚀 Starting Android Build Process" -ForegroundColor Green
Write-Host "Project Root: $ProjectRoot"
Write-Host "Build Type: $BuildType"
Write-Host "Build Variant: $BuildVariant"

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if Java is installed
try {
    $javaVersion = java -version 2>&1 | Select-Object -First 1
    Write-Host "Java version: $javaVersion" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Java is not installed. Please install Java JDK 17 or higher." -ForegroundColor Red
    exit 1
}

# Navigate to project root
Set-Location $ProjectRoot

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing npm dependencies..." -ForegroundColor Yellow
    npm install
}

# Prebuild Expo native code
Write-Host "🔨 Prebuilding Expo native code..." -ForegroundColor Yellow
npx expo prebuild --platform android --clean

# Navigate to Android directory
Set-Location $AndroidDir

# Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
.\gradlew.bat clean

# Build based on variant
if ($BuildVariant -eq "aab") {
    Write-Host "📦 Building Android App Bundle (AAB)..." -ForegroundColor Yellow
    $buildTask = "bundle$($BuildType.Substring(0,1).ToUpper() + $BuildType.Substring(1))"
    .\gradlew.bat $buildTask
    
    # Find and copy AAB file
    $aabPath = Join-Path $AndroidDir "app\build\outputs\bundle\$($BuildType)Release"
    $aabFile = Get-ChildItem -Path $aabPath -Filter "*.aab" -Recurse | Select-Object -First 1
    
    if (-not $aabFile) {
        Write-Host "❌ AAB file not found!" -ForegroundColor Red
        exit 1
    }
    
    New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    Copy-Item $aabFile.FullName (Join-Path $OutputDir "app-$BuildType-$timestamp.aab")
    Write-Host "✅ AAB built successfully: $OutputDir\app-$BuildType-$timestamp.aab" -ForegroundColor Green
    
} elseif ($BuildVariant -eq "apk") {
    Write-Host "📦 Building Android APK..." -ForegroundColor Yellow
    $buildTask = "assemble$($BuildType.Substring(0,1).ToUpper() + $BuildType.Substring(1))"
    .\gradlew.bat $buildTask
    
    # Find and copy APK file
    $apkPath = Join-Path $AndroidDir "app\build\outputs\apk\$BuildType"
    $apkFile = Get-ChildItem -Path $apkPath -Filter "*.apk" -Recurse | Select-Object -First 1
    
    if (-not $apkFile) {
        Write-Host "❌ APK file not found!" -ForegroundColor Red
        exit 1
    }
    
    New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    Copy-Item $apkFile.FullName (Join-Path $OutputDir "app-$BuildType-$timestamp.apk")
    Write-Host "✅ APK built successfully: $OutputDir\app-$BuildType-$timestamp.apk" -ForegroundColor Green
} else {
    Write-Host "❌ Invalid build variant: $BuildVariant. Use 'apk' or 'aab'." -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Android build completed successfully!" -ForegroundColor Green
Write-Host "Output directory: $OutputDir"

