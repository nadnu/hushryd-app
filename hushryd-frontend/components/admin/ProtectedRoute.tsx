import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import Colors from '../../constants/Colors';
import { FontSizes, Spacing } from '../../constants/Design';
import { useAuth } from '../../contexts/AuthContext';
import { permissionsService } from '../../services/permissionsService';
import { useColorScheme } from '../useColorScheme';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'superadmin' | 'admin' | 'support' | 'manager' | 'finance';
  pageId?: string; // Add pageId for dynamic permissions
}

export default function ProtectedRoute({ children, requiredRole, pageId }: ProtectedRouteProps) {
  const { admin, isAuthenticated, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (!isLoading && !admin) {
      router.replace('/admin/login' as any);
    }
  }, [admin, isLoading]);

  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{
          marginTop: Spacing.medium,
          fontSize: FontSizes.medium,
          color: colors.textSecondary,
        }}>
          Loading...
        </Text>
      </View>
    );
  }

  if (!admin) {
    return null; // Will redirect to login
  }

  // Check role-based access
  const hasAccess = checkAccess(admin.role, requiredRole, pageId);
  
  if (!hasAccess) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: Spacing.large,
      }}>
        <Text style={{
          fontSize: FontSizes.large,
          fontWeight: 'bold',
          color: colors.error,
          textAlign: 'center',
          marginBottom: Spacing.medium,
        }}>
          Access Denied
        </Text>
        <Text style={{
          fontSize: FontSizes.medium,
          color: colors.textSecondary,
          textAlign: 'center',
          lineHeight: FontSizes.medium * 1.5,
        }}>
          You don't have permission to access this page.{'\n'}
          {pageId ? `Page: ${pageId}` : `Required role: ${requiredRole}`}
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}

// Helper function to check if user has access
function checkAccess(userRole: string, requiredRole?: string, pageId?: string): boolean {
  // If no specific role required and no pageId, allow access
  if (!requiredRole && !pageId) return true;
  
  // Role hierarchy - higher numbers have more permissions
  const roleHierarchy = {
    'superadmin': 5,
    'admin': 4,
    'manager': 3,
    'finance': 2,
    'support': 1,
  };

  // If requiredRole is specified, check role hierarchy first
  if (requiredRole) {
    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

    console.log(`Role check: ${userRole} (level ${userLevel}) trying to access ${requiredRole} (level ${requiredLevel})`);
    
    // If user meets role requirement, allow access regardless of pageId
    if (userLevel >= requiredLevel) return true;
  }
  
  // If pageId is provided and role check didn't pass, check dynamic permissions
  if (pageId) {
    const hasPageAccess = permissionsService.hasPageAccess(userRole, pageId);
    console.log(`Permission check: ${userRole} accessing ${pageId} - ${hasPageAccess ? 'Allowed' : 'Denied'}`);
    return hasPageAccess;
  }
  
  return true;
}
