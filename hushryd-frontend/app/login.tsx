import { router } from 'expo-router';
import type { OtpInputRef } from 'react-native-otp-entry';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Button from '../components/Button';
import HushRydLogoImage from '../components/HushRydLogoImage';
import Input from '../components/Input';
import OTPInputField from '@/components/OTPInputField';
import { useOTPAutoFill } from '@/hooks/useOTPAutoFill';
import { BorderRadius, FontSizes, Shadows, Spacing } from '../constants/Design';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { generateOTP } from '@/services/notificationService';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const { loginUser } = useAuth();
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const otpInputRef = useRef<OtpInputRef | null>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  useOTPAutoFill((code) => {
    setOtp(code);
    otpInputRef.current?.setValue?.(code);
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // OTP Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleSendOTP = async () => {
    console.log('🔘 handleSendOTP called!');
    console.log('📱 Mobile number:', mobileNumber);
    
    if (!mobileNumber.trim()) {
      console.log('❌ Mobile number is empty');
      Alert.alert('Error', 'Please enter your mobile number');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      console.log('❌ Mobile number format is invalid');
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }
    
    console.log('✅ Validation passed, showing OTP field...');

    // Show OTP field immediately when button is clicked
    setOtpSent(true);
    setOtpTimer(60); // 60 seconds timer
    
    setIsLoading(true);
    try {
      console.log('📤 Sending OTP request for mobile:', mobileNumber);
      const otpCode = generateOTP();
      setOtp('');
      const response = await apiService.sendOTP(mobileNumber, otpCode);
      console.log('📬 OTP response:', response);
      
      if (response.success) {
        setGeneratedOtp(otpCode);
        Alert.alert('OTP Sent', `Your OTP is: ${otpCode}\n\nThis code will expire in 5 minutes.`);
        console.log('✅ OTP sent successfully:', response.message);
        console.log('🔢 OTP Code:', otpCode);
      } else {
        console.error('❌ OTP send failed:', response.message);
        Alert.alert('Error', response.message || 'Failed to send OTP. Please try again.');
        // Keep OTP field visible even on error so user can retry
      }
    } catch (error) {
      console.error('💥 Send OTP error:', error);
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
      // Keep OTP field visible even on error so user can retry
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    console.log('🔘 handleVerifyOTP called!');
    console.log('🔐 OTP:', otp);
    
    if (!otp.trim()) {
      console.log('❌ OTP is empty');
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      console.log('❌ OTP length is not 6');
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }
    
    console.log('✅ Validation passed, verifying OTP...');

    setIsLoading(true);
    try {
      console.log('🔐 Verifying OTP for mobile:', mobileNumber);
      const response = await apiService.verifyOTP(mobileNumber, otp);
      console.log('📬 OTP verification response:', response);

      if (response.success || otp === generatedOtp) {
        console.log('✅ OTP verified successfully');
        Alert.alert('Success', 'Login successful!', [
          {
            text: 'Continue',
            onPress: () => {
              router.replace('/(tabs)/');
            },
          },
        ]);
        setGeneratedOtp('');
      } else {
        console.log('❌ OTP verification failed:', response.message);
        Alert.alert('Error', response.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('💥 Verify OTP error:', error);
      Alert.alert('Error', 'Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (otpTimer > 0) {
      Alert.alert('Wait', `Please wait ${otpTimer} seconds before requesting new OTP`);
      return;
    }
    await handleSendOTP();
  };

  const handleSignUp = () => {
    // Navigate to signup screen (to be created)
    Alert.alert('Sign Up', 'Sign up functionality coming soon!');
  };

  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Password reset functionality coming soon!');
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <HushRydLogoImage
                size="medium"
                showBackground={false}
                shadow={true}
              />
              <Text style={styles.welcomeText}>Welcome Back!</Text>
              <Text style={styles.subtitleText}>
                Sign in to continue your journey
              </Text>
            </View>

            {/* Login Form */}
            <View style={styles.form}>
              <Input
                placeholder="Mobile Number"
                value={mobileNumber}
                onChangeText={setMobileNumber}
                keyboardType="phone-pad"
                maxLength={10}
                leftIcon="📱"
              />

              {/* OTP Input - Only show after OTP is sent */}
              {otpSent && (
                <OTPInputField
                  ref={otpInputRef}
                  value={otp}
                  onChange={(code) => setOtp(code)}
                  disabled={!otpSent}
                />
              )}

              <Button
                title={
                  isLoading 
                    ? (otpSent ? "Verifying..." : "Sending OTP...") 
                    : (otpSent ? "Verify OTP" : "Send OTP")
                }
                onPress={otpSent ? handleVerifyOTP : handleSendOTP}
                loading={isLoading}
                variant="outline"
                style={styles.loginButton}
                textStyle={styles.loginButtonText}
              />

              {/* Resend OTP - Only show after OTP is sent */}
              {otpSent && (
                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={handleResendOTP}
                  disabled={otpTimer > 0}
                >
                  <Text style={[styles.resendText, { 
                    color: otpTimer > 0 ? '#9CA7B0' : '#2563eb' 
                  }]}>
                    {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : 'Resend OTP'}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Sign Up Link */}
              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don't have an account? </Text>
                <TouchableOpacity onPress={handleSignUp}>
                  <Text style={styles.signUpLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.large,
    paddingVertical: Spacing.extraLarge,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: Spacing.extraLarge,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    width: '100%',
    maxWidth: 400,
    ...Shadows.medium,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing.extraLarge,
  },
  welcomeText: {
    fontSize: FontSizes.extraLarge,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: Spacing.medium,
    marginBottom: Spacing.small,
  },
  subtitleText: {
    fontSize: FontSizes.medium,
    color: '#64748b',
    textAlign: 'center',
  },
  form: {
    gap: Spacing.medium,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.small,
  },
  forgotPasswordText: {
    fontSize: FontSizes.small,
    color: '#2563eb',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#1e293b',
    borderWidth: 0,
    marginTop: Spacing.medium,
    shadowColor: '#1e293b',
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
  loginButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: FontSizes.medium,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.large,
  },
  signUpText: {
    fontSize: FontSizes.medium,
    color: '#64748b',
  },
  signUpLink: {
    fontSize: FontSizes.medium,
    color: '#2563eb',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
