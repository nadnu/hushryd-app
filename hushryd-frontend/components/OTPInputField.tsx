import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { OtpInput, OtpInputRef } from 'react-native-otp-entry';

interface OTPInputFieldProps {
  value: string;
  length?: number;
  onChange: (code: string) => void;
  disabled?: boolean;
}

const OTPInputField = forwardRef<OtpInputRef, OTPInputFieldProps>(
  ({ value, length = 6, onChange, disabled = false }, ref) => {
    const internalRef = useRef<OtpInputRef | null>(null);

    useImperativeHandle(ref, () => ({
      clear: () => internalRef.current?.clear(),
      focus: () => internalRef.current?.focus(),
      blur: () => internalRef.current?.blur(),
      setValue: (code: string) => internalRef.current?.setValue(code),
    }));

    useEffect(() => {
      if (!internalRef.current) return;
      if (value) {
        internalRef.current.setValue(value);
      } else {
        internalRef.current.clear();
      }
    }, [value]);

    return (
      <OtpInput
        ref={(instance) => {
          internalRef.current = instance;
          if (typeof ref === 'function') {
            ref(instance);
          } else if (ref) {
            ref.current = instance;
          }
        }}
        numberOfDigits={length}
        autoFocus
        disabled={disabled}
        focusColor="#228B22"
        textInputProps={{
          keyboardType: 'number-pad',
          autoComplete: Platform.OS === 'android' ? 'sms-otp' : 'one-time-code',
          textContentType: Platform.OS === 'ios' ? 'oneTimeCode' : 'oneTimeCode',
        }}
        onTextChange={onChange}
        onFilled={onChange}
        blurOnFilled
        theme={{
          containerStyle: styles.container,
          pinCodeContainerStyle: styles.pin,
          focusedPinCodeContainerStyle: styles.pinFocused,
          pinCodeTextStyle: styles.input,
        }}
      />
    );
  },
);

OTPInputField.displayName = 'OTPInputField';

export default OTPInputField;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'space-between',
  },
  pin: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    width: 48,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#F8FAFC',
  },
  pinFocused: {
    borderColor: '#228B22',
    backgroundColor: '#ECFDF3',
  },
  input: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
});
