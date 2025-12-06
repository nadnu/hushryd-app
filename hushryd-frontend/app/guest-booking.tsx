import Button from '@/components/Button';
import OTPInputField from '@/components/OTPInputField';
import { useOTPAutoFill } from '@/hooks/useOTPAutoFill';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { BorderRadius, FontSizes, Shadows, Spacing } from '@/constants/Design';
import { router } from 'expo-router';
import type { OTPTextInput } from 'react-native-otp-entry';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { apiService } from '../services/apiService';
import { generateOTP } from '@/services/notificationService';

export default function GuestBookingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams();
  const { user, loginUser, registerUser } = useAuth();

  const [step, setStep] = useState<'mobile' | 'otp' | 'details'>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const otpInputRef = useRef<OTPTextInput | null>(null);

  useOTPAutoFill((code) => {
    setOtp(code);
    otpInputRef.current?.setValue?.(code);
  });
  const [loading, setLoading] = useState(false);
  
  // User details form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // OTP Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleSendOTP = async () => {
    if (!mobileNumber.trim()) {
      Alert.alert('Error', 'Please enter your mobile number');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const otpCode = generateOTP();
      setOtp('');
      const response = await apiService.sendOTP(mobileNumber, otpCode);
      
      if (response.success) {
        setOtpSent(true);
        setOtpTimer(60);
        setStep('otp'); // Move to OTP verification step
        setGeneratedOtp(otpCode);
        Alert.alert('Success', `OTP sent to ${mobileNumber}`);
      } else {
        Alert.alert('Error', response.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.verifyOTP(mobileNumber, otp);
      
      if (response.success || otp === generatedOtp) {
        console.log('OTP verified successfully');
        Alert.alert('Success', 'OTP verified! Complete your booking details.');
        setStep('details');
        setGeneratedOtp('');
      } else {
        console.log('OTP verification failed:', response.message);
        Alert.alert('Error', response.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      Alert.alert('Error', 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDetails = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Register new user using the auth context method
      const response = await registerUser({
        mobileNumber,
        firstName,
        lastName,
        email,
        emergencyContact,
      });

      if (response.success) {
        // Navigate to booking page
        Alert.alert('Success', 'Account created successfully!', [
          {
            text: 'OK',
            onPress: () => {
              router.push({
                pathname: '/booking',
                params: {
                  service: params.service,
                  from: params.from,
                  to: params.to,
                  date: params.date,
                  passengers: params.passengers,
                }
              });
            }
          }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error registering user:', error);
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {step === 'mobile' && 'Enter Mobile Number'}
              {step === 'otp' && 'Verify OTP'}
              {step === 'details' && 'Complete Your Profile'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {step === 'mobile' && (
              <View style={styles.formContainer}>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  We'll send a verification code to your mobile number
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Mobile Number *</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                    placeholder="Enter your 10-digit mobile number"
                    placeholderTextColor={colors.textSecondary}
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.primary }]}
                  onPress={handleSendOTP}
                  disabled={loading || !mobileNumber}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Sending...' : 'Send OTP'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 'otp' && (
              <View style={styles.formContainer}>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Enter the 6-digit code sent to {mobileNumber}
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>OTP *</Text>
                  <OTPInputField
                    ref={otpInputRef}
                    value={otp}
                    onChange={setOtp}
                    disabled={!otpSent}
                  />
                </View>

                {otpTimer > 0 && (
                  <Text style={[styles.timerText, { color: colors.textSecondary }]}>
                    Resend OTP in {otpTimer}s
                  </Text>
                )}

                {otpTimer === 0 && otpSent && (
                  <TouchableOpacity
                    style={[styles.resendButton]}
                    onPress={handleSendOTP}
                  >
                    <Text style={[styles.resendButtonText, { color: colors.primary }]}>
                      Resend OTP
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.primary }]}
                  onPress={handleVerifyOTP}
                  disabled={loading || !otp}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 'details' && (
              <View style={styles.formContainer}>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Please complete your profile to continue with booking
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>First Name *</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                    placeholder="Enter your first name"
                    placeholderTextColor={colors.textSecondary}
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Last Name *</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                    placeholder="Enter your last name"
                    placeholderTextColor={colors.textSecondary}
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                    placeholder="Enter your email (optional)"
                    placeholderTextColor={colors.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Emergency Contact</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                    placeholder="Enter emergency contact (optional)"
                    placeholderTextColor={colors.textSecondary}
                    value={emergencyContact}
                    onChangeText={setEmergencyContact}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.primary }]}
                  onPress={handleSubmitDetails}
                  disabled={loading || !firstName || !lastName}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Creating Account...' : 'Continue Booking'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: Spacing.sm,
  },
  backIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  formContainer: {
    flex: 1,
  },
  subtitle: {
    fontSize: FontSizes.md,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.md,
  },
  button: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  timerText: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  resendButton: {
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  resendButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});

