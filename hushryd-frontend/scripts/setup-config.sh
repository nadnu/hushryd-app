#!/bin/bash

# Setup Configuration Files
# This script ensures required config files exist

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_DIR="$PROJECT_ROOT/config"

echo "🔧 Setting up configuration files..."

# Create config directory if it doesn't exist
mkdir -p "$CONFIG_DIR"

# Copy maps.example.ts to maps.ts if it doesn't exist
if [ ! -f "$CONFIG_DIR/maps.ts" ]; then
    if [ -f "$CONFIG_DIR/maps.example.ts" ]; then
        echo "📋 Creating config/maps.ts from example..."
        cp "$CONFIG_DIR/maps.example.ts" "$CONFIG_DIR/maps.ts"
        echo "✅ Created config/maps.ts"
        echo "⚠️  Remember to add your Google Maps API key to config/maps.ts"
    else
        echo "⚠️  Warning: maps.example.ts not found. Creating default maps.ts..."
        cat > "$CONFIG_DIR/maps.ts" << 'EOF'
// Google Maps API Configuration
export const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY_HERE';
EOF
    fi
else
    echo "✅ config/maps.ts already exists"
fi

echo "✅ Configuration setup complete!"

