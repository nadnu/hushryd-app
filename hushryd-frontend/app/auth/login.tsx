import { router } from 'expo-router';
import type { OTPTextInput } from 'react-native-otp-entry';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/Button';
import HushRydLogoImage from '../../components/HushRydLogoImage';
import Input from '../../components/Input';
import OTPInputField from '../../components/OTPInputField';
import { useOTPAutoFill } from '../../hooks/useOTPAutoFill';
import { useColorScheme } from '../../components/useColorScheme';
import Colors from '../../constants/Colors';
import { FontSizes, Shadows, Spacing } from '../../constants/Design';
import { apiService } from '../../services/apiService';
import { generateOTP } from '../../services/notificationService';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const otpInputRef = useRef<OTPTextInput | null>(null);

  useOTPAutoFill((code) => {
    setOtp(code);
    otpInputRef.current?.setValue?.(code);
  });

  // OTP Timer effect
  React.useEffect(() => {
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
      
      setOtpSent(true);
      setOtpTimer(60); // 60 seconds timer
      setGeneratedOtp(otpCode);
      Alert.alert('Success', `OTP sent to ${mobileNumber}`);
    } catch (error) {
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

    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.verifyOTP(mobileNumber, otp);
      console.log('OTP verification response:', response);

      if (response.success || otp === generatedOtp) {
        console.log('OTP verified successfully');
        Alert.alert('Success', 'Login successful!', [
          {
            text: 'Continue',
            onPress: () => router.replace('/(tabs)/'),
          },
        ]);
        setGeneratedOtp('');
      } else {
        console.log('OTP verification failed:', response.message);
        Alert.alert('Error', response.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (otpTimer > 0) {
      Alert.alert('Wait', `Please wait ${otpTimer} seconds before requesting new OTP`);
      return;
    }
    await handleSendOTP();
  };

  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Password reset link will be sent to your email');
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Clean Background with Logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <HushRydLogoImage
              size="large"
              showBackground={false}
              shadow={true}
            />
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.subtitleText}>Sign in to continue your journey</Text>
          </View>
        </View>

        {/* Login Form - Centered */}
        <View style={styles.formContainer}>
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }, Shadows.large]}>

            <View style={styles.inputContainer}>
              <Input
                label="Mobile Number"
                placeholder="Enter your mobile number"
                value={mobileNumber}
                onChangeText={setMobileNumber}
                keyboardType="phone-pad"
                maxLength={10}
                icon={<Text style={styles.inputIcon}>📱</Text>}
              />

              {/* OTP Input - Only show after OTP is sent */}
              {otpSent && (
                <OTPInputField
                  ref={otpInputRef}
                  value={otp}
                  onChange={setOtp}
                  disabled={!otpSent}
                />
              )}

              <Button
                title={
                  loading 
                    ? (otpSent ? "Verifying..." : "Sending OTP...") 
                    : (otpSent ? "Verify OTP" : "Send OTP")
                }
                onPress={otpSent ? handleVerifyOTP : handleSendOTP}
                loading={loading}
                size="large"
                fullWidth
                style={styles.loginButton}
              />

              {/* Resend OTP - Only show after OTP is sent */}
              {otpSent && (
                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={handleResendOTP}
                  disabled={otpTimer > 0}
                >
                  <Text style={[styles.resendText, { 
                    color: otpTimer > 0 ? colors.textSecondary : colors.primary 
                  }]}>
                    {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : 'Resend OTP'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={[styles.registerText, { color: colors.textSecondary }]}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/auth/register')}>
                <Text style={[styles.registerLink, { color: colors.primary }]}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.extraLarge,
  },
  header: {
    paddingTop: Spacing.extraLarge,
    paddingBottom: Spacing.large,
    paddingHorizontal: Spacing.large,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.extraLarge,
  },
  welcomeText: {
    fontSize: FontSizes.extraLarge,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: Spacing.large,
    marginBottom: Spacing.small,
  },
  subtitleText: {
    fontSize: FontSizes.large,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
  formContainer: {
    paddingHorizontal: Spacing.large,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formCard: {
    borderRadius: 20,
    padding: Spacing.extraLarge * 1.5,
    borderWidth: 0,
    marginBottom: Spacing.large,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  inputContainer: {
    marginBottom: Spacing.large,
    gap: Spacing.large,
  },
  inputIcon: {
    fontSize: FontSizes.large,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.large,
  },
  forgotPasswordText: {
    fontSize: FontSizes.small,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: Spacing.large,
    borderRadius: 12,
    height: 56,
    shadowColor: '#32CD32',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  resendButton: {
    alignSelf: 'center',
    marginTop: Spacing.small,
    paddingVertical: Spacing.small,
    paddingHorizontal: Spacing.medium,
  },
  resendText: {
    fontSize: FontSizes.small,
    fontWeight: '600',
    textAlign: 'center',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: FontSizes.medium,
  },
  registerLink: {
    fontSize: FontSizes.medium,
    fontWeight: '700',
  },
});