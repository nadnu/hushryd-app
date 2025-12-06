import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

export interface NotificationOptions {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  showAlert?: boolean;
}

export interface NotificationData {
  [key: string]: any;
}

export const generateOTP = (length: number = 6): string => {
  const digits = '0123456789';
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return result;
};

export class NotificationService {
  private static instance: NotificationService;

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private showAlert(message: string, title: string = 'Notification') {
    Alert.alert(title, message);
  }

  private showSuccessAlert(message: string, title: string = 'Success') {
    Alert.alert(title, message, [{ text: 'OK', style: 'default' }]);
  }

  private showErrorAlert(message: string, title: string = 'Error') {
    Alert.alert(title, message, [{ text: 'OK', style: 'default' }]);
  }

  private showWarningAlert(message: string, title: string = 'Warning') {
    Alert.alert(title, message, [{ text: 'OK', style: 'default' }]);
  }

  private showInfoAlert(message: string, title: string = 'Info') {
    Alert.alert(title, message, [{ text: 'OK', style: 'default' }]);
  }

  public showNotification(options: NotificationOptions) {
    const { message, type = 'info', showAlert = true } = options;

    if (!showAlert) {
      return;
    }

    switch (type) {
      case 'success':
        this.showSuccessAlert(message, options.title);
        break;
      case 'error':
        this.showErrorAlert(message, options.title);
        break;
      case 'warning':
        this.showWarningAlert(message, options.title);
        break;
      case 'info':
      default:
        this.showInfoAlert(message, options.title);
        break;
    }
  }

  // Convenience methods
  public showSuccess(message: string, title?: string) {
    this.showNotification({
      type: 'success',
      message,
      title: title || 'Success',
    });
  }

  public showError(message: string, title?: string) {
    this.showNotification({
      type: 'error',
      message,
      title: title || 'Error',
    });
  }

  public showWarning(message: string, title?: string) {
    this.showNotification({
      type: 'warning',
      message,
      title: title || 'Warning',
    });
  }

  public showInfo(message: string, title?: string) {
    this.showNotification({
      type: 'info',
      message,
      title: title || 'Info',
    });
  }

  // API response notification helper
  public showApiResponse(response: { success: boolean; message: string; error?: string }) {
    if (response.success) {
      this.showSuccess(response.message);
    } else {
      this.showError(response.message || response.error || 'Operation failed');
    }
  }

  // Push notification methods
  public async registerForPushNotifications(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return null;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Push notification token:', token);
      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  public setupNotificationListeners(): void {
    try {
      // Set up notification handlers
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      // Handle notifications received while app is running
      const notificationListener = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
      });

      // Handle notification taps
      const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification tapped:', response);
      });

      // Cleanup function
      return () => {
        Notifications.removeNotificationSubscription(notificationListener);
        Notifications.removeNotificationSubscription(responseListener);
      };
    } catch (error) {
      console.error('Error setting up notification listeners:', error);
    }
  }

  public async sendLocalNotification(title: string, body: string, data?: NotificationData): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  public async areNotificationsEnabled(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }
}

export const notificationService = NotificationService.getInstance();