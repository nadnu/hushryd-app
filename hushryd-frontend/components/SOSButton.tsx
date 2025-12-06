import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import Colors from '../constants/Colors';
import { BorderRadius, FontSizes, Shadows, Spacing } from '../constants/Design';
import { useColorScheme } from './useColorScheme';
import { useRide } from '@/contexts/RideContext';

interface SOSButtonProps {
  onPress?: () => void;
  variant?: 'floating' | 'inline' | 'compact';
  disabled?: boolean;
  requireActiveRide?: boolean;
}

export default function SOSButton({ 
  onPress, 
  variant = 'floating',
  disabled = false,
  requireActiveRide = true,
}: SOSButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { activeRide, triggerEmergencyAlert } = useRide();
  const [isPressed, setIsPressed] = useState(false);

  const rideGuardActive = useMemo(() => {
    if (!requireActiveRide) {
      return true;
    }
    return !!activeRide;
  }, [requireActiveRide, activeRide]);

  const isButtonDisabled = disabled || !rideGuardActive;

  const handlePress = () => {
    if (isButtonDisabled) {
      if (!activeRide && requireActiveRide) {
        Alert.alert(
          'SOS Unavailable',
          'Start your ride to enable the SOS button and share your live location.',
        );
      }
      return;
    }
    
    // Haptic feedback
    Vibration.vibrate(100);
    
    // Show confirmation alert
    Alert.alert(
      'Emergency SOS',
      'Are you in an emergency situation? This will call emergency services.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Call Emergency',
          style: 'destructive',
          onPress: async () => {
            try {
              await triggerEmergencyAlert();
              if (onPress) {
                onPress();
              } else {
                router.push('/sos');
              }
            } catch (error) {
              console.error('Error calling emergency:', error);
              Alert.alert('Error', 'Could not make emergency call. Please dial your local emergency number manually.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handlePressIn = () => {
    if (!disabled) {
      setIsPressed(true);
    }
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const getButtonStyle = () => {
    switch (variant) {
      case 'compact':
        return styles.compactButton;
      case 'inline':
        return styles.inlineButton;
      default:
        return styles.floatingButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'compact':
        return styles.compactText;
      case 'inline':
        return styles.inlineText;
      default:
        return styles.floatingText;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), isButtonDisabled && styles.disabledButton]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      disabled={isButtonDisabled}
    >
      <LinearGradient
        colors={isPressed ? ['#DC2626', '#B91C1C', '#991B1B'] : ['#EF4444', '#DC2626', '#B91C1C']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.buttonContent}>
          <Text style={getTextStyle()}>🚨</Text>
          <Text style={[getTextStyle(), styles.sosText]}>SOS</Text>
        </View>
        
        {/* Pulsing animation effect */}
        {!isButtonDisabled && (
          <View style={styles.pulseRing} />
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    ...Shadows.large,
    elevation: 8,
  },
  inlineButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.medium,
  },
  compactButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    ...Shadows.small,
  },
  gradient: {
    flex: 1,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingText: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  inlineText: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  compactText: {
    fontSize: FontSizes.sm,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sosText: {
    marginLeft: Spacing.xs,
  },
  disabledButton: {
    opacity: 0.5,
  },
  pulseRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    top: -10,
    left: -10,
  },
});
