import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';

import { Ride } from '@/types/models';
import { useAuth } from './AuthContext';

interface RideContextValue {
  activeRide: Ride | null;
  startRide: (ride: Ride) => void;
  endRide: () => void;
  triggerEmergencyAlert: () => Promise<void>;
}

const RideContext = createContext<RideContextValue | undefined>(undefined);

export const RideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const { user } = useAuth();

  const startRide = useCallback(
    (ride: Ride) => {
      setActiveRide({ ...ride, status: 'in-progress' });
    },
    [],
  );

  const endRide = useCallback(() => {
    setActiveRide(null);
  }, []);

  const triggerEmergencyAlert = useCallback(async () => {
    if (!activeRide) {
      Alert.alert('No Active Ride', 'Start a ride to enable emergency SOS alerts.');
      return;
    }

    const emergencyNumber = Platform.select({ ios: '112', android: '112', default: '112' }) || '112';
    const contactPhone = user?.emergencyContact?.phone;
    const contactName = user?.emergencyContact?.name ?? 'Emergency Contact';
    const passengerName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || 'Passenger';

    const locationDescription = activeRide.from.address || activeRide.from.city;
    const coordinates = activeRide.from.coordinates
      ? `${activeRide.from.coordinates.lat},${activeRide.from.coordinates.lng}`
      : undefined;
    const googleMapsUrl = coordinates ? `https://maps.google.com/?q=${coordinates}` : undefined;

    const messageLines = [
      `SOS Alert from ${passengerName}!`,
      `Ride: ${activeRide.from.city} → ${activeRide.to.city}`,
      `Last known location: ${locationDescription}`,
      `Time: ${new Date().toLocaleString()}`,
    ];

    if (googleMapsUrl) {
      messageLines.push(`Map: ${googleMapsUrl}`);
    }

    const alertMessage = messageLines.join('\n');

    if (contactPhone) {
      try {
        await Linking.openURL(`sms:${contactPhone}?body=${encodeURIComponent(alertMessage)}`);
      } catch (error) {
        console.error('Failed to open SMS app for emergency contact:', error);
        Alert.alert(
          'Unable to send SMS',
          `Please contact ${contactName} at ${contactPhone} manually with your location.`,
        );
      }
    } else {
      Alert.alert(
        'No Emergency Contact Found',
        'Add an emergency contact in your profile to notify them automatically.',
      );
    }

    try {
      await Linking.openURL(`tel:${emergencyNumber}`);
    } catch (error) {
      console.error('Failed to initiate emergency call:', error);
      Alert.alert('Emergency Call Failed', `Please dial ${emergencyNumber} manually.`);
    }

    Alert.alert(
      'SOS Alert Sent',
      `Emergency services have been alerted.${
        contactPhone ? ` ${contactName} has been notified with your ride details.` : ''
      }`,
    );
  }, [activeRide, user]);

  const value = useMemo(
    () => ({ activeRide, startRide, endRide, triggerEmergencyAlert }),
    [activeRide, startRide, endRide, triggerEmergencyAlert],
  );

  return <RideContext.Provider value={value}>{children}</RideContext.Provider>;
};

export const useRide = () => {
  const context = useContext(RideContext);
  if (!context) {
    throw new Error('useRide must be used within a RideProvider');
  }
  return context;
};
