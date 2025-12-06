import * as SMS from 'expo-sms';
import * as MailComposer from 'expo-mail-composer';
import { Linking, Platform } from 'react-native';

import { Ride } from '@/types/models';
import { generateOTP, notificationService } from './notificationService';

interface PassengerInfo {
  name: string;
  phone?: string;
  email?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
}

export interface BookingNotificationPayload {
  ride: Ride;
  seats: number;
  totalPrice: number;
  passenger: PassengerInfo;
}

const TERMS_AND_CONDITIONS = `Terms & Conditions:\n• Carry a valid ID proof.\n• Be ready 10 minutes before pickup.\n• No smoking or alcohol during the ride.\n• Cancellation charges may apply.\n• Contact support for any discrepancies.`;

export const sendBookingNotifications = async ({
  ride,
  seats,
  totalPrice,
  passenger,
}: BookingNotificationPayload) => {
  const otp = generateOTP();
  const rideSummary = `Ride: ${ride.from.city} → ${ride.to.city}\nDate: ${ride.date} ${ride.time}\nSeats: ${seats}\nVehicle: ${ride.vehicle.make} ${ride.vehicle.model}`;
  const passengerName = passenger.name || 'Passenger';

  await Promise.all([
    sendSMSOtp(passenger.phone, passengerName, rideSummary, otp),
    sendWhatsAppNotification(passenger.phone, passengerName, rideSummary, otp),
    sendEmailNotification(passenger.email, passengerName, rideSummary, otp, totalPrice),
  ]);

  notificationService.showSuccess(
    'Booking confirmed! Notifications have been sent to your registered contacts.',
  );

  return otp;
};

const sendSMSOtp = async (
  phoneNumber: string | undefined,
  passengerName: string,
  rideSummary: string,
  otp: string,
) => {
  if (!phoneNumber) return;
  try {
    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('SMS service unavailable');
    }

    const message = `Hello ${passengerName},\nYour booking is confirmed.\n${rideSummary}\nOTP: ${otp}\n\n${TERMS_AND_CONDITIONS}`;
    await SMS.sendSMSAsync([phoneNumber], message, { allowAndroidSendWithoutReadPermission: true });
  } catch (error) {
    console.warn('[Booking] Failed to send SMS', error);
  }
};

const sendWhatsAppNotification = async (
  phoneNumber: string | undefined,
  passengerName: string,
  rideSummary: string,
  otp: string,
) => {
  if (!phoneNumber) return;
  try {
    const normalized = phoneNumber.replace(/[^\d]/g, '');
    const message = `Hi ${passengerName}, your HushRyd booking is confirmed!%0a${rideSummary.replace(/\n/g, '%0a')}%0aOTP: ${otp}%0a%0a${TERMS_AND_CONDITIONS.replace(/\n/g, '%0a')}`;
    const whatsappUrl = `https://wa.me/${normalized}?text=${message}`;
    const canOpen = await Linking.canOpenURL(whatsappUrl);
    if (canOpen) {
      await Linking.openURL(whatsappUrl);
    }
  } catch (error) {
    console.warn('[Booking] Failed to open WhatsApp', error);
  }
};

const sendEmailNotification = async (
  email: string | undefined,
  passengerName: string,
  rideSummary: string,
  otp: string,
  totalPrice: number,
) => {
  if (!email) return;
  try {
    const isAvailable = await MailComposer.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Mail composer unavailable');
    }

    const subject = 'HushRyd Booking Confirmation';
    const body = `Hello ${passengerName},\n\nYour booking is confirmed.\n${rideSummary}\nTotal: ₹${totalPrice}\nOTP: ${otp}\n\n${TERMS_AND_CONDITIONS.replace(/\n/g, '\n')}\n\nThank you for choosing HushRyd!`;

    await MailComposer.composeAsync({
      recipients: [email],
      subject,
      body,
    });
  } catch (error) {
    console.warn('[Booking] Failed to compose email', error);
  }
};
