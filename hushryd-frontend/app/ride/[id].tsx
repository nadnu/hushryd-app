import Button from '@/components/Button';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { CURRENCY_SYMBOL } from '@/constants/Colors';
import { getReviewsForUser, getRideById } from '@/services/mockData';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { sendBookingNotifications } from '@/services/bookingNotificationService';

export default function RideDetailsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { id } = useLocalSearchParams();

  const ride = getRideById(id as string);
  const [selectedSeats, setSelectedSeats] = useState(1);
  const { user } = useAuth();

  if (!ride) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Ride not found</Text>
      </View>
    );
  }

  const driverReviews = getReviewsForUser(ride.publisher.id);
  const totalPrice = ride.price * selectedSeats;

  const handleBooking = () => {
    if (selectedSeats > ride.availableSeats) {
      Alert.alert('Error', 'Not enough seats available');
      return;
    }

    Alert.alert(
      'Confirm Booking',
      `Book ${selectedSeats} seat${selectedSeats > 1 ? 's' : ''} for ${CURRENCY_SYMBOL}${totalPrice}?\n\nDriver: ${ride.publisher.name}\nRoute: ${ride.from.city} → ${ride.to.city}\nDate: ${ride.date} at ${ride.time}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm Booking',
          onPress: async () => {
            try {
              const passengerName = [user?.firstName, user?.lastName]
                .filter(Boolean)
                .join(' ')
                .trim() || user?.name || 'Passenger';

              await sendBookingNotifications({
                ride,
                seats: selectedSeats,
                totalPrice,
                passenger: {
                  name: passengerName,
                  phone: user?.mobileNumber,
                  email: user?.email,
                  emergencyContact: user?.emergencyContact,
                },
              });
            } catch (error) {
              console.warn('Failed to send booking notifications', error);
            }

            Alert.alert(
              '🎉 Booking Successful!',
              `Your booking is confirmed!\n\nBooking ID: #BK${Date.now()
                .toString()
                .slice(-6)}\nSeats: ${selectedSeats}\nTotal: ${CURRENCY_SYMBOL}${totalPrice}\n\nDriver will contact you soon for pickup details.`,
              [
                {
                  text: 'View My Rides',
                  onPress: () => router.push('/(tabs)/rides'),
                },
                {
                  text: 'Book Another Ride',
                  onPress: () => router.push('/(tabs)/'),
                },
              ],
            );
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Ride Details',
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Route Information */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.routeHeader}>
            <View style={styles.routeInfo}>
              <View style={styles.locationRow}>
                <Text style={styles.locationDot}>●</Text>
                <View style={styles.locationDetails}>
                  <Text style={[styles.cityText, { color: colors.text }]}>{ride.from.city}</Text>
                  {ride.from.address && (
                    <Text style={[styles.addressText, { color: colors.textSecondary }]}>
                      {ride.from.address}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.connector} />
              <View style={styles.locationRow}>
                <Text style={styles.locationDot}>●</Text>
                <View style={styles.locationDetails}>
                  <Text style={[styles.cityText, { color: colors.text }]}>{ride.to.city}</Text>
                  {ride.to.address && (
                    <Text style={[styles.addressText, { color: colors.textSecondary }]}>
                      {ride.to.address}
                    </Text>
                  )}
                </View>
              </View>
            </View>
            <View style={styles.priceContainer}>
              <Text style={[styles.price, { color: colors.primary }]}>{CURRENCY_SYMBOL}{ride.price}</Text>
              <Text style={[styles.perPerson, { color: colors.textSecondary }]}>per seat</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>📅</Text>
              <Text style={[styles.detailText, { color: colors.text }]}>{ride.date}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>🕐</Text>
              <Text style={[styles.detailText, { color: colors.text }]}>{ride.time}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>⏱️</Text>
              <Text style={[styles.detailText, { color: colors.text }]}>{ride.duration || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>📏</Text>
              <Text style={[styles.detailText, { color: colors.text }]}>{ride.distance || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Driver Information */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Driver</Text>
          <View style={styles.driverInfo}>
            <Text style={styles.driverAvatar}>{ride.publisher.avatar || '👤'}</Text>
            <View style={styles.driverDetails}>
              <View style={styles.driverNameRow}>
                <Text style={[styles.driverName, { color: colors.text }]}>{ride.publisher.name}</Text>
                {ride.publisher.verified && <Text style={styles.verified}>✓</Text>}
              </View>
              <View style={styles.ratingRow}>
                <Text style={styles.star}>⭐</Text>
                <Text style={[styles.rating, { color: colors.textSecondary }]}>
                  {ride.publisher.rating.toFixed(1)} ({ride.publisher.reviewCount} reviews)
                </Text>
              </View>
              <Text style={[styles.memberSince, { color: colors.textSecondary }]}>
                Member since {ride.publisher.memberSince}
              </Text>
            </View>
          </View>
          {ride.publisher.bio && (
            <>
              <View style={styles.divider} />
              <Text style={[styles.bioText, { color: colors.textSecondary }]}>{ride.publisher.bio}</Text>
            </>
          )}
        </View>

        {/* Vehicle Information */}
        {ride.vehicle && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Vehicle</Text>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleIcon}>🚗</Text>
              <View>
                <Text style={[styles.vehicleText, { color: colors.text }]}>
                  {ride.vehicle.make} {ride.vehicle.model}
                </Text>
                <Text style={[styles.vehicleSubtext, { color: colors.textSecondary }]}>
                  {ride.vehicle.color} • {ride.vehicle.year || 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Preferences */}
        {ride.preferences && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Ride Preferences</Text>
            <View style={styles.preferencesGrid}>
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceIcon}>{ride.preferences.smoking ? '🚬' : '🚭'}</Text>
                <Text style={[styles.preferenceText, { color: colors.textSecondary }]}>
                  {ride.preferences.smoking ? 'Smoking OK' : 'No smoking'}
                </Text>
              </View>
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceIcon}>{ride.preferences.pets ? '🐕' : '🚫'}</Text>
                <Text style={[styles.preferenceText, { color: colors.textSecondary }]}>
                  {ride.preferences.pets ? 'Pets OK' : 'No pets'}
                </Text>
              </View>
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceIcon}>{ride.preferences.music ? '🎵' : '🔇'}</Text>
                <Text style={[styles.preferenceText, { color: colors.textSecondary }]}>
                  {ride.preferences.music ? 'Music' : 'Quiet'}
                </Text>
              </View>
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceIcon}>💬</Text>
                <Text style={[styles.preferenceText, { color: colors.textSecondary }]}>
                  {ride.preferences.chatty}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Description */}
        {ride.description && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>About this ride</Text>
            <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
              {ride.description}
            </Text>
          </View>
        )}

        {/* Reviews */}
        {driverReviews.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Recent Reviews ({driverReviews.length})
            </Text>
            {driverReviews.slice(0, 3).map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAvatar}>{review.fromUser.avatar || '👤'}</Text>
                  <View style={styles.reviewInfo}>
                    <Text style={[styles.reviewName, { color: colors.text }]}>{review.fromUser.name}</Text>
                    <View style={styles.ratingRow}>
                      <Text style={styles.star}>⭐</Text>
                      <Text style={[styles.rating, { color: colors.textSecondary }]}>{review.rating}/5</Text>
                    </View>
                  </View>
                </View>
                {review.comment && (
                  <Text style={[styles.reviewComment, { color: colors.textSecondary }]}>
                    {review.comment}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Booking Section */}
        <View style={[styles.bookingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Book this ride</Text>
          
          <View style={styles.seatsSelector}>
            <Text style={[styles.seatsLabel, { color: colors.text }]}>Number of seats:</Text>
            <View style={styles.seatsControl}>
              <Button
                title="-"
                onPress={() => setSelectedSeats(Math.max(1, selectedSeats - 1))}
                variant="outline"
                size="small"
                disabled={selectedSeats === 1}
              />
              <Text style={[styles.seatsValue, { color: colors.text }]}>{selectedSeats}</Text>
              <Button
                title="+"
                onPress={() => setSelectedSeats(Math.min(ride.availableSeats, selectedSeats + 1))}
                variant="outline"
                size="small"
                disabled={selectedSeats === ride.availableSeats}
              />
            </View>
          </View>

          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total:</Text>
            <Text style={[styles.totalPrice, { color: colors.primary }]}>{CURRENCY_SYMBOL}{totalPrice}</Text>
          </View>

          <Button
            title={`Book ${selectedSeats} seat${selectedSeats > 1 ? 's' : ''} for ${CURRENCY_SYMBOL}${totalPrice}`}
            onPress={handleBooking}
            size="large"
            style={styles.bookButton}
            disabled={ride.availableSeats === 0}
          />

          <Text style={[styles.availableSeats, { color: colors.textSecondary }]}>
            {ride.availableSeats} seat{ride.availableSeats !== 1 ? 's' : ''} available
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  bookingCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  routeInfo: {
    flex: 1,
    marginRight: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationDot: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 4,
    color: '#00AFF5',
  },
  locationDetails: {
    flex: 1,
  },
  cityText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
  },
  connector: {
    width: 2,
    height: 20,
    backgroundColor: '#E0E0E0',
    marginLeft: 6,
    marginVertical: 8,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
  },
  perPerson: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
  },
  detailIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '500',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    fontSize: 64,
    marginRight: 16,
  },
  driverDetails: {
    flex: 1,
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  driverName: {
    fontSize: 20,
    fontWeight: '600',
    marginRight: 8,
  },
  verified: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  star: {
    fontSize: 14,
    marginRight: 4,
  },
  rating: {
    fontSize: 14,
  },
  memberSince: {
    fontSize: 13,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  vehicleText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  vehicleSubtext: {
    fontSize: 14,
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
  },
  preferenceIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  preferenceText: {
    fontSize: 14,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  reviewItem: {
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  reviewInfo: {
    flex: 1,
  },
  reviewName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 44,
  },
  seatsSelector: {
    marginBottom: 16,
  },
  seatsLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  seatsControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  seatsValue: {
    fontSize: 24,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: 28,
    fontWeight: '700',
  },
  bookButton: {
    marginBottom: 12,
  },
  availableSeats: {
    textAlign: 'center',
    fontSize: 14,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 48,
  },
});

