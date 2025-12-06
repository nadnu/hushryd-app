import { useEffect } from 'react';
import { Platform } from 'react-native';
import RNOtpVerify from 'react-native-otp-verify';

/**
 * Hook that listens for incoming SMS OTP codes on Android using the SMS Retriever API.
 * On iOS, the OS handles auto fill via textContentType="oneTimeCode" on the input field.
 */
export const useOTPAutoFill = (onOTPDetected: (code: string) => void) => {
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    let isMounted = true;

    const startListener = async () => {
      try {
        const otp = await RNOtpVerify.getOtp();
        if (!otp || !isMounted) {
          return;
        }
        RNOtpVerify.addListener((message) => {
          if (!message || !isMounted) return;
          const match = message.match(/\b\d{4,8}\b/);
          if (match && match[0]) {
            onOTPDetected(match[0]);
            RNOtpVerify.removeListener();
            RNOtpVerify.stopOtpListener();
          }
        });
      } catch (error) {
        console.warn('[OTP] Failed to start SMS listener', error);
      }
    };

    startListener();

    return () => {
      isMounted = false;
      try {
        RNOtpVerify.removeListener();
        RNOtpVerify.stopOtpListener();
      } catch (error) {
        console.warn('[OTP] Failed to stop SMS listener', error);
      }
    };
  }, [onOTPDetected]);
};
