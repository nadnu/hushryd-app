import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors, { CURRENCY_SYMBOL } from '../constants/Colors';
import { BorderRadius, FontSizes, Shadows, Spacing } from '../constants/Design';
import { Ride } from '../types/models';
import { useColorScheme } from './useColorScheme';
import RatingModal from './RatingModal';
import { apiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import { useRide } from '@/contexts/RideContext';
import Button from './Button';

interface RideCardProps {
  ride: Ride;
  isPassenger?: boolean; // Whether current user is a passenger (not the publisher)
  onRatingSubmitted?: () => void;
}

export default function RideCard({ ride, isPassenger = false, onRatingSubmitted }: RideCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const { activeRide, startRide, endRide } = useRide();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [isCheckingRating, setIsCheckingRating] = useState(false);

  // Check if user has already rated this ride
  useEffect(() => {
    const checkExistingRating = async () => {
      if (!isPassenger || ride.status !== 'completed' || !user) {
        return;
      }

      setIsCheckingRating(true);
      try {
        const token = await apiService.getToken();
        if (token) {
          const response = await apiService.getRideRating(token, ride.id);
          if (response.success && response.data?.hasRated) {
            setHasRated(true);
          }
        }
      } catch (error) {
        console.error('Error checking rating:', error);
        // If API fails, default to showing the rating prompt
      } finally {
        setIsCheckingRating(false);
      }
    };

    checkExistingRating();
  }, [ride.id, ride.status, isPassenger, user]);

  const handlePress = () => {
    router.push(`/ride/${ride.id}`);
  };

  // Check if this is a completed ride that needs rating
  const isCompleted = ride.status === 'completed';
  const shouldShowRatingPrompt = isCompleted && isPassenger && !hasRated && user;

  // Determine target type (driver or owner)
  const targetType = ride.publisherRole === 'driver' ? 'driver' : 'owner';
  const targetName = ride.publisher.name;

  const isActiveRide = useMemo(() => activeRide?.id === ride.id, [activeRide, ride.id]);

  const handleStartRide = () => {
    if (ride.status === 'completed' || ride.status === 'cancelled') {
      Alert.alert('Ride Unavailable', 'Only upcoming rides can be started.');
      return;
    }
    if (activeRide && activeRide.id !== ride.id) {
      Alert.alert('Ride Already In Progress', 'Please end your current ride before starting a new one.');
      return;
    }
    startRide(ride);
    Alert.alert('Ride Started', 'Live safety tracking and SOS are now active for this journey.');
  };

  const handleEndRide = () => {
    Alert.alert('End Ride?', 'This will mark your current ride as completed and disable SOS tracking.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Ride',
        style: 'destructive',
        onPress: () => {
          endRide();
          Alert.alert('Ride Ended', 'Glad you arrived safely!');
        },
      },
    ]);
  };

  const handleRatingSubmit = async (rating: number, feedback?: string) => {
    try {
      const token = await apiService.getToken();
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      const response = await apiService.rateDriverOrOwner(
        token,
        ride.id,
        ride.publisherId,
        targetType,
        rating,
        feedback
      );

      if (response.success) {
        setHasRated(true);
        setShowRatingModal(false);
        Alert.alert('Success', 'Thank you for your rating!');
        onRatingSubmitted?.();
      } else {
        throw new Error(response.message || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      throw error;
    }
  };

  const handleRatingButtonPress = () => {
    setShowRatingModal(true);
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Date & Time Header */}
      <View style={styles.header}>
        <View style={styles.dateTime}>
          <Text style={[styles.time, { color: colors.text }]}>{ride.time}</Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>{ride.date}</Text>
        </View>
        <View style={styles.headerBadges}>
          {isActiveRide && (
            <View
              style={[
                styles.activeBadge,
                { borderColor: colors.primary, backgroundColor: colors.primary + '20' },
              ]}
            >
              <Text style={[styles.activeBadgeText, { color: colors.primary }]}>IN PROGRESS</Text>
            </View>
          )}
          {/* Large Vehicle Indicator */}
          {ride.seats >= 7 && (
            <View style={[styles.largeVehicleBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.largeVehicleText}>👥 {ride.seats} SEATER</Text>
            </View>
          )}
          <View style={[styles.badge, { backgroundColor: colors.lightGray }]}>
            <Text style={[styles.badgeText, { color: colors.text }]}>
              {ride.type === 'carpool' ? '🚗' : '🚙'}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Route */}
      <View style={styles.routeContainer}>
        <View style={styles.routeIndicators}>
          <View style={[styles.dot, styles.startDot, { backgroundColor: colors.primary }]} />
          <View style={[styles.line, { backgroundColor: colors.mediumGray }]} />
          <View style={[styles.dot, styles.endDot, { backgroundColor: colors.error }]} />
        </View>
        <View style={styles.locations}>
          <View style={styles.locationRow}>
            <Text style={[styles.city, { color: colors.text }]} numberOfLines={1}>
              {ride.from.city}
            </Text>
            {ride.from.address && (
              <Text style={[styles.address, { color: colors.textSecondary }]} numberOfLines={1}>
                {ride.from.address}
              </Text>
            )}
          </View>
          <View style={styles.durationContainer}>
            <Text style={[styles.duration, { color: colors.textTertiary }]}>
              {ride.duration || 'N/A'} • {ride.distance || 'N/A'}
            </Text>
          </View>
          <View style={styles.locationRow}>
            <Text style={[styles.city, { color: colors.text }]} numberOfLines={1}>
              {ride.to.city}
            </Text>
            {ride.to.address && (
              <Text style={[styles.address, { color: colors.textSecondary }]} numberOfLines={1}>
                {ride.to.address}
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Rating Prompt for Completed Rides */}
      {shouldShowRatingPrompt && (
        <View style={[styles.ratingPrompt, { backgroundColor: colors.lightGray, borderColor: colors.border }]}>
          <View style={styles.ratingPromptContent}>
            <Text style={[styles.ratingPromptText, { color: colors.text }]}>
              Rate your {targetType === 'driver' ? 'driver' : 'vehicle owner'}
            </Text>
            <TouchableOpacity
              style={[styles.rateButton, { backgroundColor: colors.primary }]}
              onPress={handleRatingButtonPress}
            >
              <Text style={styles.rateButtonText}>Rate Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isPassenger && (
        <View style={styles.rideActions}>
          {isActiveRide ? (
            <Button
              title="End Ride"
              onPress={handleEndRide}
              variant="secondary"
              size="small"
            />
          ) : (
            <Button
              title="Start Ride"
              onPress={handleStartRide}
              variant="primary"
              size="small"
              disabled={ride.status !== 'upcoming'}
            />
          )}
        </View>
      )}

      {/* Driver & Price Footer */}
      <View style={styles.footer}>
        <View style={styles.driverSection}>
          <Text style={styles.avatar}>{ride.publisher.avatar || '👤'}</Text>
          <View style={styles.driverInfo}>
            <Text style={[styles.driverName, { color: colors.text }]} numberOfLines={1}>
              {ride.publisher.name}
            </Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.star}>⭐</Text>
              <Text style={[styles.rating, { color: colors.textSecondary }]}>
                {ride.publisher.rating.toFixed(1)}
              </Text>
              {ride.publisher.verified && <Text style={[styles.verified, { color: colors.success }]}>✓</Text>}
            </View>
          </View>
        </View>
        <View style={styles.priceSection}>
          <Text style={[styles.price, { color: colors.primary }]}>{CURRENCY_SYMBOL}{ride.price}</Text>
          <Text style={[styles.seats, { color: colors.textTertiary }]}>
            {ride.availableSeats} {ride.availableSeats === 1 ? 'seat' : 'seats'}
          </Text>
        </View>
      </View>

      {/* Rating Modal */}
      {shouldShowRatingPrompt && (
        <RatingModal
          visible={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleRatingSubmit}
          targetName={targetName}
          targetType={targetType}
          rideId={ride.id}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    ...Shadows.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  dateTime: {
    flex: 1,
  },
  time: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    marginBottom: 2,
  },
  date: {
    fontSize: FontSizes.sm,
  },
  headerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  largeVehicleBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  largeVehicleText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    fontSize: FontSizes.lg,
  },
  activeBadge: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
  },
  activeBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  rideActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  routeContainer: {
    flexDirection: 'row',
    marginVertical: Spacing.sm,
  },
  routeIndicators: {
    width: 24,
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  startDot: {
    marginTop: 4,
  },
  endDot: {
    marginBottom: 4,
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: Spacing.xs,
  },
  locations: {
    flex: 1,
    justifyContent: 'space-between',
  },
  locationRow: {
    marginVertical: Spacing.xs,
  },
  city: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginBottom: 2,
  },
  address: {
    fontSize: FontSizes.sm,
  },
  durationContainer: {
    marginVertical: Spacing.sm,
  },
  duration: {
    fontSize: FontSizes.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    fontSize: 40,
    marginRight: Spacing.md,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 14,
    marginRight: 4,
  },
  rating: {
    fontSize: FontSizes.sm,
  },
  verified: {
    fontSize: 16,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    marginBottom: 2,
  },
  seats: {
    fontSize: FontSizes.xs,
  },
  ratingPrompt: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
  },
  ratingPromptContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingPromptText: {
    fontSize: FontSizes.medium,
    fontWeight: '600',
    flex: 1,
  },
  rateButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.medium,
  },
  rateButtonText: {
    fontSize: FontSizes.small,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
