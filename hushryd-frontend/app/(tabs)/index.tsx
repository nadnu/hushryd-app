import HeroBanner from '@/components/HeroBanner';
import LiveChat from '@/components/LiveChat';
import SearchBar from '@/components/SearchBar';
import SOSButton from '@/components/SOSButton';
import TimeslotFilter from '@/components/TimeslotFilter';
import TimeslotSection from '@/components/TimeslotSection';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { BorderRadius, FontSizes, Shadows, Spacing } from '@/constants/Design';
import { useAuth } from '@/contexts/AuthContext';
import { useRide } from '@/contexts/RideContext';
import {
  afternoonTimeslots,
  earlyMorningTimeslots,
  eveningTimeslots,
  lateEveningTimeslots,
  lateMorningTimeslots,
  morningTimeslots,
  nightTimeslots,
  popularTimeslots,
} from '@/services/mockData';
import { SearchParams } from '@/types/models';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedType, setSelectedType] = useState<'all' | 'carpool' | 'private'>('all');
  const [selectedTimeslotFilter, setSelectedTimeslotFilter] = useState<
    'all' | 'early-morning' | 'morning' | 'late-morning' | 'afternoon' | 'evening' | 'late-evening' | 'night'
  >('all');
  const [showLiveChat, setShowLiveChat] = useState(false);
  const { user } = useAuth();
  const { activeRide } = useRide();

  const handleSearch = (params: SearchParams) => {
    router.push({
      pathname: '/search',
      params: { ...params, type: selectedType },
    });
  };

  const handleTimeslotPress = (timeslot: any) => {
    router.push(`/ride/${timeslot.rideId}`);
  };

  const handleViewAllTimeslots = () => {
    router.push({
      pathname: '/search',
      params: {
        from: 'Hyderabad',
        to: 'Vijayawada',
        date: new Date().toISOString().split('T')[0],
        passengers: 1,
        type: selectedType,
      },
    });
  };

  const filteredTimeslots = useMemo(() => {
    switch (selectedTimeslotFilter) {
      case 'early-morning':
        return earlyMorningTimeslots;
      case 'morning':
        return morningTimeslots;
      case 'late-morning':
        return lateMorningTimeslots;
      case 'afternoon':
        return afternoonTimeslots;
      case 'evening':
        return eveningTimeslots;
      case 'late-evening':
        return lateEveningTimeslots;
      case 'night':
        return nightTimeslots;
      default:
        return popularTimeslots;
    }
  }, [selectedTimeslotFilter]);

  const timeslotTitle = useMemo(() => {
    switch (selectedTimeslotFilter) {
      case 'early-morning':
        return 'Early Morning Rides';
      case 'morning':
        return 'Morning Rides';
      case 'late-morning':
        return 'Late Morning Rides';
      case 'afternoon':
        return 'Afternoon Rides';
      case 'evening':
        return 'Evening Rides';
      case 'late-evening':
        return 'Late Evening Rides';
      case 'night':
        return 'Night Rides';
      default:
        return 'Popular Timeslots';
    }
  }, [selectedTimeslotFilter]);

  const timeslotSubtitle = useMemo(() => {
    switch (selectedTimeslotFilter) {
      case 'early-morning':
        return 'Early morning departures (4-7 AM)';
      case 'morning':
        return 'Morning departures (7-10 AM)';
      case 'late-morning':
        return 'Late morning departures (10 AM-1 PM)';
      case 'afternoon':
        return 'Afternoon departures (1-4 PM)';
      case 'evening':
        return 'Evening departures (4-7 PM)';
      case 'late-evening':
        return 'Late evening departures (7-10 PM)';
      case 'night':
        return 'Night departures (10 PM-1 AM)';
      default:
        return 'Quick book available rides for today';
    }
  }, [selectedTimeslotFilter]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentInsetAdjustmentBehavior="automatic"
      >
        <HeroBanner />

        {/* Find Your Next Ride Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchSectionHeader}>
            <Text style={[styles.searchSectionTitle, { color: colors.text }]}>Find Your Next Ride</Text>
            <Text style={[styles.searchSectionSubtitle, { color: colors.textSecondary }]}>
              Book instantly or plan ahead
            </Text>
          </View>
          <View style={[styles.searchCard, { backgroundColor: colors.card }]}>
            <SearchBar onSearch={handleSearch} />
          </View>
        </View>

        <View style={styles.typeSelectorSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>How are you travelling today?</Text>
          <View style={styles.typeButtons}>
            <TouchableOpacity
              style={[
                styles.typeCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                selectedType === 'all' && [styles.typeCardActive, { borderColor: colors.primary }],
              ]}
              onPress={() => setSelectedType('all')}
              activeOpacity={0.7}
            >
              <Text style={styles.typeIcon}>🚗</Text>
              <Text style={[styles.typeTitle, { color: colors.text }]}>All Rides</Text>
              <Text style={[styles.typeDescription, { color: colors.textSecondary }]}>Browse all options</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                selectedType === 'carpool' && [styles.typeCardActive, { borderColor: colors.primary }],
              ]}
              onPress={() => setSelectedType('carpool')}
              activeOpacity={0.7}
            >
              <Text style={styles.typeIcon}>🚗</Text>
              <Text style={[styles.typeTitle, { color: colors.text }]}>Carpool</Text>
              <Text style={[styles.typeDescription, { color: colors.textSecondary }]}>Share the costs</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                selectedType === 'private' && [styles.typeCardActive, { borderColor: colors.primary }],
              ]}
              onPress={() => setSelectedType('private')}
              activeOpacity={0.7}
            >
              <Text style={styles.typeIcon}>🚙</Text>
              <Text style={[styles.typeTitle, { color: colors.text }]}>Private</Text>
              <Text style={[styles.typeDescription, { color: colors.textSecondary }]}>Premium rides</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TimeslotFilter
          selectedFilter={selectedTimeslotFilter}
          onFilterChange={setSelectedTimeslotFilter}
        />

        <TimeslotSection
          title={timeslotTitle}
          subtitle={timeslotSubtitle}
          timeslots={filteredTimeslots.slice(0, 4)}
          onTimeslotPress={handleTimeslotPress}
          onViewAllPress={handleViewAllTimeslots}
        />

        <View style={[styles.businessSection, styles.responsiveHideSection]}>
          <View style={styles.businessHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>How HushRyd Works</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Connecting communities through smart, affordable transportation</Text>
          </View>
          
          <View style={styles.businessGrid}>
            <View style={[styles.businessCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.businessCardHeader}>
                <View style={[styles.businessIconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={styles.businessIcon}>🚗</Text>
                </View>
                <Text style={[styles.businessCardTitle, { color: colors.text }]}>For Drivers</Text>
              </View>
              <View style={styles.businessContent}>
                <Text style={[styles.businessText, { color: colors.textSecondary }]}>• Earn money by sharing your ride</Text>
                <Text style={[styles.businessText, { color: colors.textSecondary }]}>• Split fuel costs with passengers</Text>
                <Text style={[styles.businessText, { color: colors.textSecondary }]}>• Flexible scheduling</Text>
                <Text style={[styles.businessText, { color: colors.textSecondary }]}>• Verified passenger profiles</Text>
              </View>
            </View>

            <View style={[styles.businessCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.businessCardHeader}>
                <View style={[styles.businessIconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={styles.businessIcon}>👥</Text>
                </View>
                <Text style={[styles.businessCardTitle, { color: colors.text }]}>For Passengers</Text>
              </View>
              <View style={styles.businessContent}>
                <Text style={[styles.businessText, { color: colors.textSecondary }]}>• Affordable travel options</Text>
                <Text style={[styles.businessText, { color: colors.textSecondary }]}>• Safe and verified drivers</Text>
                <Text style={[styles.businessText, { color: colors.textSecondary }]}>• Real-time tracking</Text>
                <Text style={[styles.businessText, { color: colors.textSecondary }]}>• Easy booking process</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsSection}>
            <Text style={[styles.statsTitle, { color: colors.text }]}>Our Impact</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: colors.statsBackground || colors.cardBackground, borderColor: colors.border }]}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>50K+</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active Users</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.statsBackground || colors.cardBackground, borderColor: colors.border }]}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>1M+</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rides Completed</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.statsBackground || colors.cardBackground, borderColor: colors.border }]}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>4.8★</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>User Rating</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.statsBackground || colors.cardBackground, borderColor: colors.border }]}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>100%</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Verified Drivers</Text>
              </View>
            </View>
          </View>

          <View style={[styles.missionCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
            <View style={styles.missionContent}>
              <Text style={styles.missionIcon}>🎯</Text>
              <Text style={[styles.missionTitle, { color: colors.text }]}>Our Mission</Text>
              <Text style={[styles.missionText, { color: colors.textSecondary }]}>To revolutionize inter-city travel in India by providing affordable, safe, and convenient ride-sharing solutions that connect communities and reduce transportation costs for everyone.</Text>
            </View>
          </View>
        </View>

      {/* Why ride with HushRyd? */}
      <View style={styles.featuresSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Why ride with HushRyd?</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            We are redefining intercity travel by prioritizing safety, transparency, and community for everyone.
          </Text>
        </View>
        
        <View style={styles.featuresGrid}>
          <View style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>💰</Text>
            </View>
            <Text style={[styles.featureTitle, { color: colors.text }]}>Unbeatable Prices</Text>
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              Travel for a fraction of the cost of trains or buses. Driver-shared costs mean value for all.
            </Text>
          </View>

          <View style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>✅</Text>
            </View>
            <Text style={[styles.featureTitle, { color: colors.text }]}>Verified Community</Text>
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              Every member provides Government ID. We verify addresses and things so you know exactly who you're traveling with.
            </Text>
          </View>

          <View style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>⚡</Text>
            </View>
            <Text style={[styles.featureTitle, { color: colors.text }]}>Instant Booking</Text>
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              No more waiting lists. Find a ride, book your seat instantly, and get immediate confirmation via SMS and app.
            </Text>
          </View>
        </View>
      </View>

      {/* Safety First Section */}
      <View style={[styles.safetySection, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Safety First</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Your safety is our priority
          </Text>
        </View>
        <Text style={[styles.safetyDescription, { color: colors.textSecondary }]}>
          We've built state-of-the-art safety features to ensure peace of mind on every kilometer of your journey.
        </Text>

        <View style={styles.safetyFeaturesGrid}>
          <View style={[styles.safetyFeatureCard, { backgroundColor: colors.card }]}>
            <Text style={styles.safetyFeatureIcon}>📍</Text>
            <Text style={[styles.safetyFeatureTitle, { color: colors.text }]}>Real-time Ride Tracking</Text>
            <Text style={[styles.safetyFeatureText, { color: colors.textSecondary }]}>
              Share your live location with friends and family. They can track your journey from start to finish on a map, even if they don't have the app.
            </Text>
            <View style={styles.safetyFeatureBullets}>
              <Text style={[styles.bulletText, { color: colors.textSecondary }]}>• Live GPS updates every 5 seconds</Text>
              <Text style={[styles.bulletText, { color: colors.textSecondary }]}>• Shareable trip link via WhatsApp/SMS</Text>
            </View>
          </View>

          <View style={[styles.safetyFeatureCard, { backgroundColor: colors.card }]}>
            <Text style={styles.safetyFeatureIcon}>🆘</Text>
            <Text style={[styles.safetyFeatureTitle, { color: colors.text }]}>24/7 SOS Support</Text>
            <Text style={[styles.safetyFeatureText, { color: colors.textSecondary }]}>
              In the unlikely event of an emergency, help is just one tap away. Our dedicated safety response team is available around the clock to assist you.
            </Text>
          </View>
        </View>
      </View>

      {/* Driver Earning Section */}
      <View style={styles.driverSection}>
        <View style={[styles.driverCard, { backgroundColor: colors.primary }]}>
          <View style={styles.driverContent}>
            <Text style={styles.driverTitle}>For Drivers</Text>
            <Text style={styles.driverSubtitle}>Empty seats are expensive seats.</Text>
            <Text style={styles.driverDescription}>
              Cover your fuel costs by sharing your ride. It's easy to post, you choose your passengers, and you get paid directly to your bank account.
            </Text>
            <View style={styles.driverStats}>
              <Text style={styles.driverStatAmount}>₹15,000</Text>
              <Text style={styles.driverStatLabel}>Avg. monthly earnings</Text>
            </View>
            <View style={styles.driverFeatures}>
              <Text style={styles.driverFeature}>• Post a ride in under 2 minutes</Text>
              <Text style={styles.driverFeature}>• Choose who rides with you</Text>
              <Text style={styles.driverFeature}>• Instant bank transfers after ride completion</Text>
            </View>
            <TouchableOpacity 
              style={styles.driverButton}
              onPress={() => router.push('/publish')}
            >
              <Text style={styles.driverButtonText}>Post a Ride Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
    
    {activeRide && (
      <View style={styles.sosButtonContainer}>
        <SOSButton variant="floating" />
      </View>
    )}
    
    <TouchableOpacity
      style={styles.liveChatButton}
      onPress={() => setShowLiveChat(true)}
      activeOpacity={0.8}
    >
      <Ionicons name="chatbubble" size={32} color="#FFFFFF" />
    </TouchableOpacity>

    <LiveChat visible={showLiveChat} onClose={() => setShowLiveChat(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  sosButtonContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 1000,
  },
  liveChatButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.large,
    zIndex: 1000,
  },
  searchSection: {
    marginTop: -Spacing.xxxl,
    marginHorizontal: Spacing.lg,
  },
  searchSectionHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  searchSectionTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  searchSectionSubtitle: {
    fontSize: FontSizes.md,
    textAlign: 'center',
  },
  searchCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.large,
  },
  typeSelectorSection: {
    padding: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: FontSizes.md,
    marginBottom: Spacing.lg,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  typeCard: {
    flex: 1,
    minWidth: 160,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    alignItems: 'center',
    ...Shadows.small,
  },
  typeCardActive: {
    borderWidth: 3,
  },
  typeIcon: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  typeTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  typeDescription: {
    fontSize: FontSizes.xs,
    textAlign: 'center',
  },
  businessSection: {
    padding: Spacing.xl,
    paddingTop: 0,
  },
  responsiveHideSection: {
    ...(Platform.OS !== 'web' ? { display: 'none' } : {}),
  },
  businessHeader: {
    marginBottom: Spacing.lg,
  },
  businessGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    flexWrap: 'wrap',
  },
  businessCard: {
    flex: 1,
    minWidth: 250,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    ...Shadows.small,
  },
  businessCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  businessIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  businessIcon: {
    fontSize: 24,
  },
  businessCardTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    flex: 1,
  },
  businessContent: {
    flex: 1,
  },
  businessText: {
    fontSize: FontSizes.sm,
    lineHeight: 22,
    marginBottom: Spacing.xs,
  },
  statsSection: {
    marginBottom: Spacing.xl,
  },
  statsTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'space-between',
  },
  statCard: {
    flexBasis: '48%',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    ...Shadows.small,
  },
  statNumber: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
    fontWeight: '500',
  },
  missionCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    ...Shadows.small,
  },
  missionContent: {
    alignItems: 'center',
  },
  missionIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  missionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  missionText: {
    fontSize: FontSizes.md,
    lineHeight: 24,
    textAlign: 'center',
  },
  featuresSection: {
    padding: Spacing.xl,
    paddingTop: Spacing.xxxl,
  },
  sectionHeader: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  sectionSubtitle: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
  featuresGrid: {
    gap: Spacing.lg,
  },
  featureCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    ...Shadows.small,
  },
  featureIconContainer: {
    marginBottom: Spacing.md,
  },
  featureIcon: {
    fontSize: 48,
  },
  featureTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  featureText: {
    fontSize: FontSizes.md,
    lineHeight: 22,
    textAlign: 'center',
  },
  safetySection: {
    padding: Spacing.xl,
    paddingVertical: Spacing.xxxl,
    marginTop: Spacing.xl,
  },
  safetyDescription: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  safetyFeaturesGrid: {
    gap: Spacing.lg,
  },
  safetyFeatureCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  safetyFeatureIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  safetyFeatureTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  safetyFeatureText: {
    fontSize: FontSizes.md,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  safetyFeatureBullets: {
    marginTop: Spacing.sm,
  },
  bulletText: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  driverSection: {
    padding: Spacing.xl,
    paddingTop: 0,
  },
  driverCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxxl,
    ...Shadows.large,
  },
  driverContent: {
    alignItems: 'center',
  },
  driverTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  driverSubtitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  driverDescription: {
    fontSize: FontSizes.md,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  driverStats: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BorderRadius.lg,
    width: '100%',
  },
  driverStatAmount: {
    fontSize: FontSizes.xxxl + 8,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  driverStatLabel: {
    fontSize: FontSizes.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  driverFeatures: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  driverFeature: {
    fontSize: FontSizes.md,
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.md,
  },
  driverButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    ...Shadows.medium,
  },
  driverButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: '#2563EB',
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});

