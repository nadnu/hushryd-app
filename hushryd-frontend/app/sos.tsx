import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View
} from 'react-native';
import SOSButton from '../components/SOSButton';
import { useColorScheme } from '../components/useColorScheme';
import Colors from '../constants/Colors';
import { BorderRadius, FontSizes, Shadows, Spacing } from '../constants/Design';
import { EmergencyService, SOSAlert } from '../types/sos';

const { width } = Dimensions.get('window');

export default function SOSScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [location, setLocation] = useState<{latitude: number, longitude: number, address: string} | null>(null);
  const [emergencyServices, setEmergencyServices] = useState<EmergencyService[]>([]);

  useEffect(() => {
    // Get current location
    getCurrentLocation();
    // Load emergency services
    loadEmergencyServices();
  }, []);

  const getCurrentLocation = async () => {
    // Mock location for now - in real app, use expo-location
    setLocation({
      latitude: 17.3850,
      longitude: 78.4867,
      address: 'Hyderabad, Telangana, India'
    });
  };

  const loadEmergencyServices = () => {
    // Mock emergency services data
    setEmergencyServices([
      { id: '1', name: 'Police', phone: '100', type: 'police', area: 'Hyderabad', isActive: true },
      { id: '2', name: 'Ambulance', phone: '108', type: 'ambulance', area: 'Hyderabad', isActive: true },
      { id: '3', name: 'Fire Service', phone: '101', type: 'fire', area: 'Hyderabad', isActive: true },
      { id: '4', name: 'Roadside Assistance', phone: '+91-9876543210', type: 'roadside', area: 'Hyderabad', isActive: true },
    ]);
  };

  const handleSOSAlert = () => {
    setIsEmergencyActive(true);
    Vibration.vibrate([0, 500, 200, 500]); // Emergency vibration pattern
    
    // Create SOS alert
    const sosAlert: SOSAlert = {
      id: Date.now().toString(),
      userId: 'current-user-id',
      userName: 'Current User',
      userPhone: '+91-9876543210',
      location: location!,
      timestamp: new Date().toISOString(),
      status: 'active',
      emergencyType: 'safety',
      priority: 'critical',
      description: 'Emergency SOS activated by user'
    };

    // Send alert to admin dashboard and emergency contacts
    sendSOSAlert(sosAlert);
    
    Alert.alert(
      'SOS Alert Sent!',
      'Emergency services and your contacts have been notified. Help is on the way.',
      [{ text: 'OK' }]
    );
  };

  const sendSOSAlert = (alert: SOSAlert) => {
    // In real app, send to backend API
    console.log('SOS Alert:', alert);
  };

  const callEmergencyService = (service: EmergencyService) => {
    Alert.alert(
      `Call ${service.name}?`,
      `This will call ${service.name} at ${service.phone}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => {
            Linking.openURL(`tel:${service.phone}`);
          }
        }
      ]
    );
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'police': return '🚔';
      case 'ambulance': return '🚑';
      case 'fire': return '🚒';
      case 'roadside': return '🔧';
      default: return '📞';
    }
  };

  const getServiceColor = (type: string) => {
    switch (type) {
      case 'police': return ['#3B82F6', '#1D4ED8'];
      case 'ambulance': return ['#EF4444', '#DC2626'];
      case 'fire': return ['#F97316', '#EA580C'];
      case 'roadside': return ['#10B981', '#059669'];
      default: return ['#6B7280', '#4B5563'];
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Emergency SOS</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Quick access to emergency services
        </Text>
      </View>

      {/* Emergency Status */}
      {isEmergencyActive && (
        <View style={styles.emergencyStatus}>
          <LinearGradient
            colors={['#EF4444', '#DC2626', '#B91C1C']}
            style={styles.emergencyGradient}
          >
            <Text style={styles.emergencyText}>🚨 EMERGENCY ACTIVE 🚨</Text>
            <Text style={styles.emergencySubtext}>
              Help is on the way. Stay calm and stay safe.
            </Text>
          </LinearGradient>
        </View>
      )}

      {/* Main SOS Button */}
      <View style={styles.sosButtonContainer}>
        <SOSButton 
          onPress={handleSOSAlert}
          variant="floating"
          disabled={isEmergencyActive}
          requireActiveRide={false}
        />
        <Text style={[styles.sosButtonLabel, { color: colors.text }]}>
          Tap for Emergency
        </Text>
      </View>

      {/* Current Location */}
      <View style={[styles.locationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>📍 Current Location</Text>
        <Text style={[styles.locationText, { color: colors.textSecondary }]}>
          {location?.address || 'Getting location...'}
        </Text>
      </View>

      {/* Emergency Services */}
      <View style={styles.servicesSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Emergency Services</Text>
        <View style={styles.servicesGrid}>
          {emergencyServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.serviceCard}
              onPress={() => callEmergencyService(service)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={getServiceColor(service.type)}
                style={styles.serviceGradient}
              >
                <Text style={styles.serviceIcon}>{getServiceIcon(service.type)}</Text>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.servicePhone}>{service.phone}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Safety Tips */}
      <View style={[styles.safetyTipsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>🛡️ Safety Tips</Text>
        <View style={styles.tipsList}>
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            • Stay calm and assess the situation
          </Text>
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            • Move to a safe location if possible
          </Text>
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            • Keep your phone charged and accessible
          </Text>
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            • Share your location with trusted contacts
          </Text>
        </View>
      </View>

      {/* Emergency Contacts */}
      <View style={[styles.contactsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>👥 Emergency Contacts</Text>
        <TouchableOpacity 
          style={styles.addContactButton}
          onPress={() => router.push('/sos/contacts')}
        >
          <Text style={[styles.addContactText, { color: colors.primary }]}>
            + Add Emergency Contacts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Cancel Emergency */}
      {isEmergencyActive && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setIsEmergencyActive(false)}
        >
          <Text style={styles.cancelButtonText}>Cancel Emergency</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: FontSizes.xxxl,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
  },
  headerSubtitle: {
    fontSize: FontSizes.md,
    textAlign: 'center',
  },
  emergencyStatus: {
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  emergencyGradient: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  emergencyText: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emergencySubtext: {
    fontSize: FontSizes.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  sosButtonContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  sosButtonLabel: {
    fontSize: FontSizes.md,
    fontWeight: '500',
    marginTop: Spacing.md,
  },
  locationCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  cardTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
  },
  locationText: {
    fontSize: FontSizes.md,
    lineHeight: 20,
  },
  servicesSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: (width - Spacing.lg * 3) / 2,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  serviceGradient: {
    padding: Spacing.lg,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  serviceIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  serviceName: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  servicePhone: {
    fontSize: FontSizes.sm,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  safetyTipsCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  tipsList: {
    marginTop: Spacing.sm,
  },
  tipText: {
    fontSize: FontSizes.md,
    lineHeight: 22,
    marginBottom: Spacing.xs,
  },
  contactsCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  addContactButton: {
    marginTop: Spacing.sm,
  },
  addContactText: {
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#6B7280',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  cancelButtonText: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
