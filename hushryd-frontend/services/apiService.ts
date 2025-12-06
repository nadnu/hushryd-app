import { Platform } from 'react-native';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface AdminUserData {
  name: string;
  email: string;
  role: string;
  status?: 'active' | 'inactive';
  department?: string;
  permissions?: string[];
}

export interface RideData {
  driverId: string;
  passengerId: string;
  from: string;
  to: string;
  distance: number;
  fare: number;
  status?: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
}

export interface BookingData {
  userId: string;
  rideId: string;
  bookingDate: string;
  status?: 'confirmed' | 'pending' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  amount: number;
}

export interface TransactionData {
  userId: string;
  type: 'payment' | 'refund' | 'payout';
  amount: number;
  status?: 'pending' | 'completed' | 'failed';
  description: string;
}

export class ApiService {
  private static instance: ApiService;
  private baseUrl: string;
  private defaultTimeout: number = 30000; // 30 seconds default timeout

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  constructor() {
    const isWeb = Platform.OS === 'web';

    // Prefer runtime environment variable, otherwise fall back to sensible defaults per platform
    const fallbackBaseUrl = isWeb
      ? 'http://localhost:3000/api'
      : 'http://10.0.2.2:3000/api';

    this.baseUrl = process.env.EXPO_PUBLIC_API_URL || fallbackBaseUrl;

    if (!isWeb && this.baseUrl.includes('localhost')) {
      console.warn(
        '[ApiService] Detected localhost base URL on a native device. ' +
        'Consider setting EXPO_PUBLIC_API_URL to a reachable IP address (e.g. http://10.0.2.2:3000/api for Android emulator).'
      );
    }
  }

  // Generic API call method with authentication
  private async apiCall<T = any>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    token?: string,
    timeout: number = this.defaultTimeout
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    try {
      timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const url = `${this.baseUrl}${endpoint}`;
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      };

      // Add authorization header if token is provided
      if (token) {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
        };
      }

      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }

      console.log(`🌐 API Call: ${method} ${url}`);
      console.log('📤 Request data:', data);
      
      const response = await fetch(url, options);
      
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      const result = await response.json();

      // Log the response for debugging
      console.log(`📬 Response status: ${response.status}, ok: ${response.ok}`);
      console.log('📦 Response data:', result);

      // Backend uses 'error' instead of 'success'
      if (!response.ok || result.error) {
        console.error('API call failed:', {
          status: response.status,
          error: result.error,
          message: result.message
        });
        return {
          success: false,
          message: result.message || 'API request failed',
          error: result.error || 'Unknown error',
        };
      }

      return {
        success: true,
        message: result.message || 'Operation successful',
        data: result.data || result,
      };
    } catch (error) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      console.error('API call failed:', error);
      
      // Check if error is due to timeout
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          message: `Request timeout: The server took longer than ${timeout}ms to respond`,
          error: 'Request timeout',
        };
      }
      
      return {
        success: false,
        message: 'Network error or server unavailable',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Authentication API
  public async adminLogin(email: string, password: string): Promise<ApiResponse> {
    return this.apiCall('/auth/admin/login', 'POST', { email, password });
  }

  public async userLogin(email: string, password: string): Promise<ApiResponse> {
    return this.apiCall('/auth/login', 'POST', { email, password });
  }

  public async userRegister(userData: { email: string; password: string; firstName: string; lastName: string; phone?: string }): Promise<ApiResponse> {
    return this.apiCall('/auth/register', 'POST', userData);
  }

  // OTP-based Login
  public async sendOTP(mobileNumber: string, otp?: string): Promise<ApiResponse> {
    return this.apiCall('/auth/send-otp', 'POST', { mobileNumber, otp });
  }

  public async verifyOTP(mobileNumber: string, otp: string): Promise<ApiResponse> {
    return this.apiCall('/auth/verify-otp', 'POST', { mobileNumber, otp });
  }

  public async registerUser(userData: {
    mobileNumber: string;
    firstName: string;
    lastName: string;
    email?: string;
    emergencyContact?: string;
  }): Promise<ApiResponse> {
    return this.apiCall('/auth/register', 'POST', userData);
  }

  // Admin Users API
  public async createAdminUser(userData: AdminUserData, token: string): Promise<ApiResponse> {
    return this.apiCall('/admins', 'POST', userData, token);
  }

  public async updateAdminUser(id: string, userData: Partial<AdminUserData>, token: string): Promise<ApiResponse> {
    return this.apiCall(`/admins/${id}`, 'PUT', userData, token);
  }

  public async deleteAdminUser(id: string, token: string): Promise<ApiResponse> {
    return this.apiCall(`/admins/${id}`, 'DELETE', undefined, token);
  }

  public async getAdminUsers(token: string): Promise<ApiResponse> {
    return this.apiCall('/admins', 'GET', undefined, token);
  }

  public async getAdminUserById(id: string, token: string): Promise<ApiResponse> {
    return this.apiCall(`/admins/${id}`, 'GET', undefined, token);
  }

  public async getAdminStats(token: string): Promise<ApiResponse> {
    return this.apiCall('/admins/stats/overview', 'GET', undefined, token);
  }

  // Users API
  public async createUser(userData: any, token: string): Promise<ApiResponse> {
    return this.apiCall('/users', 'POST', userData, token);
  }

  public async updateUser(id: string, userData: any, token: string): Promise<ApiResponse> {
    return this.apiCall(`/users/${id}`, 'PUT', userData, token);
  }

  public async deleteUser(id: string, token: string): Promise<ApiResponse> {
    return this.apiCall(`/users/${id}`, 'DELETE', undefined, token);
  }

  public async getUsers(token: string): Promise<ApiResponse> {
    return this.apiCall('/users', 'GET', undefined, token);
  }

  public async getUserById(id: string, token: string): Promise<ApiResponse> {
    return this.apiCall(`/users/${id}`, 'GET', undefined, token);
  }

  public async getUserStats(token: string): Promise<ApiResponse> {
    return this.apiCall('/users/stats/overview', 'GET', undefined, token);
  }

  // User Profile API
  public async getUserProfile(token: string): Promise<ApiResponse> {
    return this.apiCall('/users/me', 'GET', undefined, token);
  }

  public async updateUserProfile(userData: any, token: string): Promise<ApiResponse> {
    return this.apiCall('/users/me', 'PUT', userData, token);
  }

  public async getUserBookings(token: string): Promise<ApiResponse> {
    return this.apiCall('/users/me/bookings', 'GET', undefined, token);
  }

  public async getUserComplaints(token: string): Promise<ApiResponse> {
    return this.apiCall('/users/me/complaints', 'GET', undefined, token);
  }

  // Logout API
  public async logout(token: string): Promise<ApiResponse> {
    return this.apiCall('/auth/logout', 'POST', undefined, token);
  }

  public async createComplaint(complaintData: any, token: string): Promise<ApiResponse> {
    return this.apiCall('/complaints', 'POST', complaintData, token);
  }

  // Rides API
  public async createRide(rideData: RideData, token: string): Promise<ApiResponse> {
    return this.apiCall('/rides', 'POST', rideData, token);
  }

  public async updateRide(id: string, rideData: Partial<RideData>, token: string): Promise<ApiResponse> {
    return this.apiCall(`/rides/${id}`, 'PUT', rideData, token);
  }

  public async deleteRide(id: string, token: string): Promise<ApiResponse> {
    return this.apiCall(`/rides/${id}`, 'DELETE', undefined, token);
  }

  public async getRides(token: string): Promise<ApiResponse> {
    return this.apiCall('/rides', 'GET', undefined, token);
  }

  public async getRideById(id: string, token: string): Promise<ApiResponse> {
    return this.apiCall(`/rides/${id}`, 'GET', undefined, token);
  }

  public async getRideStats(token: string): Promise<ApiResponse> {
    return this.apiCall('/rides/stats/overview', 'GET', undefined, token);
  }

  public async searchRides(fromCity: string, toCity: string, date: string, passengers: number, token: string): Promise<ApiResponse> {
    return this.apiCall(`/rides/search?from=${fromCity}&to=${toCity}&date=${date}&passengers=${passengers}`, 'GET', undefined, token);
  }

  // Bookings API
  public async createBooking(bookingData: BookingData, token: string): Promise<ApiResponse> {
    return this.apiCall('/bookings', 'POST', bookingData, token);
  }

  public async updateBooking(id: string, bookingData: Partial<BookingData>, token: string): Promise<ApiResponse> {
    return this.apiCall(`/bookings/${id}`, 'PUT', bookingData, token);
  }

  public async deleteBooking(id: string, token: string): Promise<ApiResponse> {
    return this.apiCall(`/bookings/${id}`, 'DELETE', undefined, token);
  }

  public async getBookings(token: string): Promise<ApiResponse> {
    return this.apiCall('/bookings', 'GET', undefined, token);
  }

  public async getBookingById(id: string, token: string): Promise<ApiResponse> {
    return this.apiCall(`/bookings/${id}`, 'GET', undefined, token);
  }

  public async getUserBookings(userId: string, token: string): Promise<ApiResponse> {
    return this.apiCall(`/bookings/user/${userId}`, 'GET', undefined, token);
  }

  public async cancelBooking(id: string, token: string): Promise<ApiResponse> {
    return this.apiCall(`/bookings/${id}/cancel`, 'POST', undefined, token);
  }

  public async getBookingStats(token: string): Promise<ApiResponse> {
    return this.apiCall('/bookings/stats/overview', 'GET', undefined, token);
  }

  // Transactions API
  public async createTransaction(transactionData: TransactionData, token: string): Promise<ApiResponse> {
    return this.apiCall('/transactions', 'POST', transactionData, token);
  }

  public async updateTransaction(id: string, transactionData: Partial<TransactionData>, token: string): Promise<ApiResponse> {
    return this.apiCall(`/transactions/${id}`, 'PUT', transactionData, token);
  }

  public async deleteTransaction(id: string, token: string): Promise<ApiResponse> {
    return this.apiCall(`/transactions/${id}`, 'DELETE', undefined, token);
  }

  public async getTransactions(token: string): Promise<ApiResponse> {
    return this.apiCall('/transactions', 'GET', undefined, token);
  }

  public async getTransactionById(id: string, token: string): Promise<ApiResponse> {
    return this.apiCall(`/transactions/${id}`, 'GET', undefined, token);
  }

  public async getUserTransactions(userId: string, token: string): Promise<ApiResponse> {
    return this.apiCall(`/transactions/user/${userId}`, 'GET', undefined, token);
  }

  // Database Management API
  public async seedDatabase(token: string): Promise<ApiResponse> {
    return this.apiCall('/database/seed', 'POST', undefined, token);
  }

  public async clearDatabase(token: string): Promise<ApiResponse> {
    return this.apiCall('/database/clear', 'DELETE', undefined, token);
  }

  public async getDatabaseStats(token: string): Promise<ApiResponse> {
    return this.apiCall('/database/stats', 'GET', undefined, token);
  }

  public async runMigrations(token: string): Promise<ApiResponse> {
    return this.apiCall('/database/migrate', 'POST', undefined, token);
  }

  // Dashboard API
  public async getDashboardStats(token: string): Promise<ApiResponse> {
    return this.apiCall('/dashboard/stats', 'GET', undefined, token);
  }

  public async getDashboardAnalytics(token: string, period: string = '7d'): Promise<ApiResponse> {
    return this.apiCall(`/dashboard/analytics?period=${period}`, 'GET', undefined, token);
  }

  public async getDashboardRecentActivity(token: string): Promise<ApiResponse> {
    return this.apiCall('/dashboard/recent-activity', 'GET', undefined, token);
  }

  // SMS Gateway API
  public async getSmsGatewaySettings(token: string): Promise<ApiResponse> {
    return this.apiCall('/sms-gateway/settings', 'GET', undefined, token);
  }

  public async updateSmsGatewaySettings(settings: any, token: string): Promise<ApiResponse> {
    return this.apiCall('/sms-gateway/settings', 'POST', settings, token);
  }

  public async getSmsBalance(token: string): Promise<ApiResponse> {
    return this.apiCall('/sms-gateway/balance', 'GET', undefined, token);
  }

  public async getSmsUsage(token: string, startDate?: string, endDate?: string): Promise<ApiResponse> {
    const params = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : '';
    return this.apiCall(`/sms-gateway/usage${params}`, 'GET', undefined, token);
  }

  public async sendTestSms(mobileNumber: string, token: string): Promise<ApiResponse> {
    return this.apiCall('/sms-gateway/test', 'POST', { mobileNumber }, token);
  }

  // Offers API
  public async getOffers(token: string): Promise<ApiResponse> {
    return this.apiCall('/offers', 'GET', undefined, token);
  }

  public async getActiveOffers(): Promise<ApiResponse> {
    return this.apiCall('/offers/active', 'GET');
  }

  public async getOfferById(id: string, token: string): Promise<ApiResponse> {
    return this.apiCall(`/offers/${id}`, 'GET', undefined, token);
  }

  public async createOffer(offerData: any, token: string): Promise<ApiResponse> {
    return this.apiCall('/offers', 'POST', offerData, token);
  }

  public async updateOffer(id: string, offerData: any, token: string): Promise<ApiResponse> {
    return this.apiCall(`/offers/${id}`, 'PUT', offerData, token);
  }

  public async deleteOffer(id: string, token: string): Promise<ApiResponse> {
    return this.apiCall(`/offers/${id}`, 'DELETE', undefined, token);
  }

  public async getOfferUsage(id: string, token: string): Promise<ApiResponse> {
    return this.apiCall(`/offers/${id}/usage`, 'GET', undefined, token);
  }

  public async verifyOfferCode(code: string, amount?: number): Promise<ApiResponse> {
    return this.apiCall('/offers/verify', 'POST', { code, amount });
  }

  // Payment Methods API
  public async getPaymentMethods(token: string): Promise<ApiResponse> {
    return this.apiCall('/payment/methods', 'GET', undefined, token);
  }

  public async addPaymentMethod(token: string, methodData: any): Promise<ApiResponse> {
    return this.apiCall('/payment/methods', 'POST', methodData, token);
  }

  public async removePaymentMethod(token: string, methodId: string): Promise<ApiResponse> {
    return this.apiCall(`/payment/methods/${methodId}`, 'DELETE', undefined, token);
  }

  public async setDefaultPaymentMethod(token: string, methodId: string): Promise<ApiResponse> {
    return this.apiCall(`/payment/methods/${methodId}/default`, 'PUT', undefined, token);
  }

  public async getTransactionHistory(token: string): Promise<ApiResponse> {
    return this.apiCall('/payment/transactions', 'GET', undefined, token);
  }

  // Rides API
  public async getUserRides(token: string): Promise<ApiResponse> {
    return this.apiCall('/rides/user', 'GET', undefined, token);
  }

  public async cancelRide(token: string, rideId: string): Promise<ApiResponse> {
    return this.apiCall(`/rides/${rideId}/cancel`, 'PUT', undefined, token);
  }

  public async trackRide(token: string, rideId: string): Promise<ApiResponse> {
    return this.apiCall(`/rides/${rideId}/track`, 'GET', undefined, token);
  }

  public async rateRide(token: string, rideId: string, rating: number, feedback?: string): Promise<ApiResponse> {
    return this.apiCall(`/rides/${rideId}/rate`, 'POST', { rating, feedback }, token);
  }

  // Rate driver/owner after completed ride
  public async rateDriverOrOwner(
    token: string,
    rideId: string,
    targetUserId: string,
    targetType: 'driver' | 'owner',
    rating: number,
    feedback?: string
  ): Promise<ApiResponse> {
    return this.apiCall(
      `/rides/${rideId}/rate-${targetType}`,
      'POST',
      { targetUserId, rating, feedback },
      token
    );
  }

  // Check if passenger has already rated this ride
  public async getRideRating(token: string, rideId: string): Promise<ApiResponse> {
    return this.apiCall(`/rides/${rideId}/rating`, 'GET', undefined, token);
  }

  // Safety API
  public async getEmergencyContacts(token: string): Promise<ApiResponse> {
    return this.apiCall('/safety/emergency-contacts', 'GET', undefined, token);
  }

  public async addEmergencyContact(token: string, contactData: any): Promise<ApiResponse> {
    return this.apiCall('/safety/emergency-contacts', 'POST', contactData, token);
  }

  public async triggerSOS(token: string, location: any): Promise<ApiResponse> {
    return this.apiCall('/safety/sos', 'POST', { location }, token);
  }

  // Referral API
  public async getReferralData(token: string): Promise<ApiResponse> {
    return this.apiCall('/referral', 'GET', undefined, token);
  }

  public async getReferralHistory(token: string): Promise<ApiResponse> {
    return this.apiCall('/referral/history', 'GET', undefined, token);
  }

  // Rewards API
  public async getRewards(token: string): Promise<ApiResponse> {
    return this.apiCall('/rewards', 'GET', undefined, token);
  }

  public async redeemReward(token: string, rewardId: string): Promise<ApiResponse> {
    return this.apiCall(`/rewards/${rewardId}/redeem`, 'POST', undefined, token);
  }

  // Wallet API
  public async getWalletBalance(token: string): Promise<ApiResponse> {
    return this.apiCall('/wallet/balance', 'GET', undefined, token);
  }

  public async addMoneyToWallet(token: string, amount: number, paymentMethodId: string): Promise<ApiResponse> {
    return this.apiCall('/wallet/add-money', 'POST', { amount, paymentMethodId }, token);
  }

  public async getWalletTransactions(token: string): Promise<ApiResponse> {
    return this.apiCall('/wallet/transactions', 'GET', undefined, token);
  }

  // Notifications API
  public async getNotifications(token: string): Promise<ApiResponse> {
    return this.apiCall('/notifications', 'GET', undefined, token);
  }

  public async markNotificationRead(token: string, notificationId: string): Promise<ApiResponse> {
    return this.apiCall(`/notifications/${notificationId}/read`, 'PUT', undefined, token);
  }

  public async updateNotificationSettings(token: string, settings: any): Promise<ApiResponse> {
    return this.apiCall('/notifications/settings', 'PUT', settings, token);
  }

  // Claims API
  public async getClaims(token: string): Promise<ApiResponse> {
    return this.apiCall('/claims', 'GET', undefined, token);
  }

  public async createClaim(token: string, claimData: any): Promise<ApiResponse> {
    return this.apiCall('/claims', 'POST', claimData, token);
  }

  public async getClaimById(token: string, claimId: string): Promise<ApiResponse> {
    return this.apiCall(`/claims/${claimId}`, 'GET', undefined, token);
  }

  // Session History API
  public async getMySessions(token: string): Promise<ApiResponse> {
    return this.apiCall('/sessions/my-sessions', 'GET', undefined, token);
  }

  public async getAllSessions(token: string, filters?: { userId?: string; userType?: string; page?: number; limit?: number }): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.userType) params.append('userType', filters.userType);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const queryString = params.toString();
    return this.apiCall(`/sessions/all${queryString ? '?' + queryString : ''}`, 'GET', undefined, token);
  }

  public async getUserSessions(token: string, userId: string, page?: number, limit?: number): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    
    const queryString = params.toString();
    return this.apiCall(`/sessions/user/${userId}${queryString ? '?' + queryString : ''}`, 'GET', undefined, token);
  }

  public async endSession(token: string, sessionId: string): Promise<ApiResponse> {
    return this.apiCall(`/sessions/end/${sessionId}`, 'POST', undefined, token);
  }

  public async getSessionStats(token: string): Promise<ApiResponse> {
    return this.apiCall('/sessions/stats', 'GET', undefined, token);
  }

  // Mock API responses for development (when backend is not available)
  public async mockApiCall<T = any>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<ApiResponse<T>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // Use mock data for now to avoid import issues
      // const { realDatabaseService } = await import('./realDatabaseService');

      switch (endpoint) {
        case '/admin-users':
          if (method === 'POST') {
            const newUser = {
              id: Date.now().toString(),
              ...data,
              password: 'password123',
              createdAt: new Date().toISOString(),
            };
            return {
              success: true,
              message: `Admin user "${data.name}" created successfully!`,
              data: newUser as T,
            };
          } else if (method === 'GET') {
            const users = [
              {
                id: '1',
                name: 'Super Admin',
                email: 'admin@hushryd.com',
                role: 'superadmin',
                isActive: true,
                createdAt: new Date().toISOString(),
              },
              {
                id: '2',
                name: 'Manager',
                email: 'manager@hushryd.com',
                role: 'manager',
                isActive: true,
                createdAt: new Date().toISOString(),
              },
            ];
            return {
              success: true,
              message: 'Admin users retrieved successfully',
              data: users as T,
            };
          }
          break;

        case '/rides':
          if (method === 'POST') {
            const newRide = {
              id: Date.now().toString(),
              ...data,
              createdAt: new Date().toISOString(),
            };
            return {
              success: true,
              message: `Ride from "${data.from}" to "${data.to}" created successfully!`,
              data: newRide as T,
            };
          } else if (method === 'GET') {
            const rides = [
              {
                id: '1',
                from: 'Downtown',
                to: 'Airport',
                fare: 25.00,
                createdAt: new Date().toISOString(),
              },
            ];
            return {
              success: true,
              message: 'Rides retrieved successfully',
              data: rides as T,
            };
          }
          break;

        case '/bookings':
          if (method === 'POST') {
            const newBooking = {
              id: Date.now().toString(),
              ...data,
              createdAt: new Date().toISOString(),
            };
            return {
              success: true,
              message: `Booking created successfully!`,
              data: newBooking as T,
            };
          } else if (method === 'GET') {
            const bookings = [
              {
                id: '1',
                userId: 'user1',
                rideId: 'ride1',
                status: 'confirmed',
                createdAt: new Date().toISOString(),
              },
            ];
            return {
              success: true,
              message: 'Bookings retrieved successfully',
              data: bookings as T,
            };
          }
          break;

        case '/transactions':
          if (method === 'POST') {
            const newTransaction = {
              id: Date.now().toString(),
              ...data,
              createdAt: new Date().toISOString(),
            };
            return {
              success: true,
              message: `Transaction of $${data.amount} created successfully!`,
              data: newTransaction as T,
            };
          } else if (method === 'GET') {
            const transactions = [
              {
                id: '1',
                amount: 25.00,
                type: 'payment',
                status: 'completed',
                createdAt: new Date().toISOString(),
              },
            ];
            return {
              success: true,
              message: 'Transactions retrieved successfully',
              data: transactions as T,
            };
          }
          break;

        case '/database/seed':
          if (method === 'POST') {
            const stats = {
              totalAdminUsers: 2,
              activeUsers: 2,
              inactiveUsers: 0,
              roleDistribution: { superadmin: 1, manager: 1, support: 0 },
              totalRides: 1,
              totalBookings: 1,
              totalTransactions: 1,
              databaseSize: 1024,
              lastUpdated: new Date().toISOString(),
            };
            return {
              success: true,
              message: `Database seeded successfully! Created ${stats.totalAdminUsers} admin users.`,
              data: stats as T,
            };
          }
          break;

        case '/database/clear':
          if (method === 'DELETE') {
            return {
              success: true,
              message: 'Database cleared successfully!',
              data: null as T,
            };
          }
          break;

        case '/database/stats':
          if (method === 'GET') {
            const stats = {
              totalAdminUsers: 2,
              activeUsers: 2,
              inactiveUsers: 0,
              roleDistribution: { superadmin: 1, manager: 1, support: 0 },
              totalRides: 1,
              totalBookings: 1,
              totalTransactions: 1,
              databaseSize: 1024,
              lastUpdated: new Date().toISOString(),
            };
            return {
              success: true,
              message: 'Database statistics retrieved successfully',
              data: stats as T,
            };
          }
          break;
      }

      return {
        success: false,
        message: 'Endpoint not found',
        error: 'The requested endpoint does not exist',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Mock API operation failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Main API call method - use real backend API
  public async callApi<T = any>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    token?: string
  ): Promise<ApiResponse<T>> {
    // Always use real API calls now
    return this.apiCall<T>(endpoint, method, data, token);
  }

  // Helper method to get token from storage
  public async getToken(): Promise<string | null> {
    try {
      // Try to get token from AsyncStorage (React Native)
      if (typeof window === 'undefined') {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        return await AsyncStorage.getItem('auth_token');
      } else {
        // Try to get token from localStorage (Web)
        return localStorage.getItem('auth_token');
      }
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Helper method to save token to storage
  public async saveToken(token: string): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem('auth_token', token);
      } else {
        localStorage.setItem('auth_token', token);
      }
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  // Helper method to remove token from storage
  public async removeToken(): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.removeItem('auth_token');
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }
}

export const apiService = ApiService.getInstance();
