import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { BorderRadius, FontSizes, Shadows, Spacing } from '../constants/Design';

interface HeroBannerProps {
  // No props needed for the enhanced banner
}

const { width } = Dimensions.get('window');

export default function HeroBanner({}: HeroBannerProps) {
  return (
    <View style={styles.container}>
      {/* Main Hero Section */}
      <LinearGradient
        colors={['#1E40AF', '#2563EB', '#3B82F6']}
        style={styles.heroSection}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Main Content */}
        <View style={styles.heroContent}>
          {/* Main Tagline */}
          <View style={styles.textSection}>
            <Text style={styles.mainTagline}>India's Most Trusted Carpooling Platform</Text>
            <Text style={styles.headline}>Save Money. Make Friends.</Text>
            <Text style={styles.subheadline}>
              Join 50,000+ riders carpooling across India. Cut your travel costs by up to 70% while reducing your carbon footprint.
            </Text>
          </View>
          
          {/* Statistics */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50K+</Text>
              <Text style={styles.statLabel}>Active Users</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1M+</Text>
              <Text style={styles.statLabel}>Rides Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.8★</Text>
              <Text style={styles.statLabel}>User Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>100%</Text>
              <Text style={styles.statLabel}>Verified</Text>
            </View>
          </View>

          {/* Safety Features */}
          <View style={styles.safetyFeatures}>
            <Text style={styles.safetyText}>✓ Live GPS Tracking</Text>
            <Text style={styles.safetyText}>✓ Verified drivers</Text>
            <Text style={styles.safetyText}>✓ Safe ride tracking</Text>
            <Text style={styles.safetyText}>✓ Affordable travel</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  heroSection: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    ...Shadows.large,
    paddingVertical: Spacing.xxxl * 1.5,
    paddingHorizontal: Spacing.xl,
  },
  heroContent: {
    alignItems: 'center',
  },
  textSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  mainTagline: {
    fontSize: FontSizes.md,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginBottom: Spacing.md,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  headline: {
    fontSize: FontSizes.huge + 8,
    color: '#FFFFFF',
    fontWeight: '800',
    marginBottom: Spacing.md,
    textAlign: 'center',
    lineHeight: FontSizes.huge + 12,
  },
  subheadline: {
    fontSize: FontSizes.lg,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: Spacing.xl,
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
    marginVertical: Spacing.sm,
  },
  statNumber: {
    fontSize: FontSizes.xxxl,
    color: '#FFFFFF',
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    textAlign: 'center',
  },
  safetyFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  safetyText: {
    fontSize: FontSizes.sm,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
    paddingHorizontal: Spacing.sm,
  },
});
