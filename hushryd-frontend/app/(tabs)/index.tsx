import HeroBanner from '@/components/HeroBanner';
import LiveChat from '@/components/LiveChat';
import SearchBar from '@/components/SearchBar';
import SOSButton from '@/components/SOSButton';
import TimeslotFilter from '@/components/TimeslotFilter';
import TimeslotSection from '@/components/TimeslotSection';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { BorderRadius, FontSizes, Shadows, Spacing } from '@/constants/Design';
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
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useAuth } from '@/contexts/AuthContext';
import { useRide } from '@/contexts/RideContext';

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

        <View style={[styles.searchCard, { backgroundColor: colors.card }]}>
          <SearchBar onSearch={handleSearch} />
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
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>10K+</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Happy Users</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>500+</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Cities Connected</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>50K+</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rides Completed</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>₹2M+</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Saved on Travel</Text>
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

      <View style={styles.featuresSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Why choose HushRyd?</Text>
        
        <View style={[styles.featureCard, { backgroundColor: colors.lightGray }]}>
          <View style={styles.featureIconContainer}>
            <Text style={styles.featureIcon}>💰</Text>
          </View>
          <View style={styles.featureContent}>
            <Text style={[styles.featureTitle, { color: colors.text }]}>Your pick of rides at low prices</Text>
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>No matter where you're going, find the perfect ride from our wide range of destinations and routes at low prices.</Text>
          </View>
        </View>

        <View style={[styles.featureCard, { backgroundColor: colors.lightGray }]}>
          <View style={styles.featureIconContainer}>
            <Text style={styles.featureIcon}>🛡️</Text>
          </View>
          <View style={styles.featureContent}>
            <Text style={[styles.featureTitle, { color: colors.text }]}>Trust who you travel with</Text>
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>We check reviews, profiles and IDs, so you know who you're travelling with and can book your ride at ease.</Text>
          </View>
        </View>

        <View style={[styles.featureCard, { backgroundColor: colors.lightGray }]}>
          <View style={styles.featureIconContainer}>
            <Text style={styles.featureIcon}>📱</Text>
          </View>
          <View style={styles.featureContent}>
            <Text style={[styles.featureTitle, { color: colors.text }]}>Scroll, click, tap and go!</Text>
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>Booking a ride has never been easier! Thanks to our simple app, you can book a ride close to you in just minutes.</Text>
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
  searchCard: {
    marginTop: -Spacing.xxxl * 2,
    marginHorizontal: Spacing.lg,
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
    paddingTop: 0,
  },
  featureCard: {
    flexDirection: 'row',
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  featureIconContainer: {
    marginRight: Spacing.lg,
  },
  featureIcon: {
    fontSize: 48,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  featureText: {
    fontSize: FontSizes.md,
    lineHeight: 22,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});

