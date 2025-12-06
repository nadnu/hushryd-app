import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { NotificationData, notificationService } from '../services/notificationService';

interface NotificationContextType {
  pushToken: string | null;
  isRegistered: boolean;
  registerForNotifications: () => Promise<boolean>;
  sendLocalNotification: (title: string, body: string, data?: NotificationData) => Promise<void>;
  areNotificationsEnabled: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const registerForNotifications = useCallback(async () => {
    try {
      const token = await notificationService.registerForPushNotifications();
      if (token) {
        setPushToken(token);
        setIsRegistered(true);
        console.log('Notifications registered successfully');
        return true;
      }
      console.log('Failed to register for notifications');
      return false;
    } catch (error) {
      console.error('Error registering for notifications:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    // Set up notification listeners
    notificationService.setupNotificationListeners();

    // Register for notifications on app start
    registerForNotifications();
  }, []);

  const sendLocalNotification = useCallback(async (title: string, body: string, data?: NotificationData) => {
    await notificationService.sendLocalNotification(title, body, data);
  }, []);

  const areNotificationsEnabled = useCallback(async () => {
    return await notificationService.areNotificationsEnabled();
  }, []);

  const value: NotificationContextType = useMemo(() => ({
    pushToken,
    isRegistered,
    registerForNotifications,
    sendLocalNotification,
    areNotificationsEnabled,
  }), [pushToken, isRegistered, registerForNotifications, sendLocalNotification, areNotificationsEnabled]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
