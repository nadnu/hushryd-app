import { router } from 'expo-router';
import React, { Suspense, lazy, useCallback, useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AdminLayout from '../../components/admin/AdminLayout';
import ProtectedRoute from '../../components/admin/ProtectedRoute';
import { useColorScheme } from '../../components/useColorScheme';
import Colors from '../../constants/Colors';
import { BorderRadius, FontSizes, Shadows, Spacing } from '../../constants/Design';
import { useAuth } from '../../contexts/AuthContext';

const NotificationDemo = lazy(() => import('../../components/NotificationDemo'));

interface DashboardCardItem {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

interface StatItem {
  label: string;
  value: string;
  color: string;
}

export default function AdminDashboardScreen() {
  const { admin, logout } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showNotificationDemo, setShowNotificationDemo] = useState(false);

  const handleLogout = useCallback(async () => {
    await logout();
    router.replace('/(tabs)/' as any);
  }, [logout]);

  const dashboardCards = useMemo<DashboardCardItem[]>(() => ([
    {
      title: 'Support Tickets',
      description: 'Manage user support requests',
      icon: '🎫',
      route: '/admin/tickets',
      color: '#3b82f6',
    },
    {
      title: 'Transactions',
      description: 'View financial transactions',
      icon: '💰',
      route: '/admin/transactions',
      color: '#10b981',
    },
    {
      title: 'Payouts',
      description: 'Process driver payouts',
      icon: '💳',
      route: '/admin/payouts',
      color: '#f59e0b',
    },
    {
      title: 'Verifications',
      description: 'Review user verifications',
      icon: '✅',
      route: '/admin/verifications',
      color: '#8b5cf6',
    },
    {
      title: 'Complaints',
      description: 'Handle customer complaints',
      icon: '📝',
      route: '/admin/complaints',
      color: '#ef4444',
    },
    {
      title: 'Fare Management',
      description: 'Manage fare rules',
      icon: '📊',
      route: '/admin/fares',
      color: '#06b6d4',
    },
    {
      title: 'Support',
      description: 'General support management',
      icon: '🆘',
      route: '/admin/support',
      color: '#84cc16',
    },
    {
      title: 'Session History',
      description: 'View all user session history',
      icon: '📱',
      route: '/admin/sessions',
      color: '#06b6d4',
    },
    {
      title: 'Settings',
      description: 'System and account settings',
      icon: '⚙️',
      route: '/admin/settings',
      color: '#6b7280',
    },
    {
      title: 'Notifications',
      description: 'Test push notifications',
      icon: '🔔',
      route: 'demo',
      color: '#8b5cf6',
    },
  ]), []);

  const quickStats = useMemo<StatItem[]>(() => ([
    { label: 'Open Tickets', value: '24', color: '#f59e0b' },
    { label: 'Pending Payouts', value: '₹45,000', color: '#10b981' },
    { label: 'Verifications', value: '12', color: '#8b5cf6' },
    { label: 'Complaints', value: '8', color: '#ef4444' },
  ]), []);

  return (
    <ProtectedRoute pageId="dashboard">
      <AdminLayout title="Dashboard" currentPage="dashboard">
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Welcome Section */}
            <View style={[styles.welcomeCard, { backgroundColor: colors.card, borderColor: colors.border }, Shadows.medium]}>
              <View style={styles.welcomeContent}>
                <View>
                  <Text style={[styles.welcomeTitle, { color: colors.text }]}>
                    Welcome back, {admin?.name}!
                  </Text>
                  <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
                    Here's what's happening in your admin dashboard
                  </Text>
                </View>
                <View style={[styles.roleBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.roleText}>{admin?.role?.toUpperCase()}</Text>
                </View>
              </View>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Stats</Text>
              <View style={styles.statsGrid}>
                {quickStats.map((stat) => (
                  <StatCard
                    key={stat.label}
                    stat={stat}
                    backgroundColor={colors.card}
                    borderColor={colors.border}
                  />
                ))}
              </View>
            </View>

            {/* Dashboard Cards */}
            <View style={styles.cardsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
              <View style={styles.cardsGrid}>
                {dashboardCards.map((card) => (
                  <DashboardCard
                    key={card.title}
                    card={card}
                    cardBackground={colors.card}
                    borderColor={colors.border}
                    onPress={() => {
                      if (card.route === 'demo') {
                        setShowNotificationDemo(true);
                      } else {
                        router.push(card.route as any);
                      }
                    }}
                  />
                ))}
              </View>
            </View>

            {/* Logout Section */}
            <View style={styles.logoutSection}>
              <TouchableOpacity
                style={[styles.logoutButton, { backgroundColor: colors.error }]}
                onPress={handleLogout}
              >
                <Text style={styles.logoutButtonText}>🚪 Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Notification Demo Modal */}
        <Modal
          visible={showNotificationDemo}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowNotificationDemo(false)}
        >
          <Suspense fallback={<View style={styles.modalFallback}><Text>Loading demo…</Text></View>}>
            <NotificationDemo />
          </Suspense>
          <TouchableOpacity
            style={[styles.closeModalButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowNotificationDemo(false)}
          >
            <Text style={styles.closeModalButtonText}>Close Demo</Text>
          </TouchableOpacity>
        </Modal>
      </AdminLayout>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.large,
  },
  welcomeCard: {
    padding: Spacing.large,
    borderRadius: BorderRadius.large,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  welcomeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    marginBottom: Spacing.tiny,
  },
  welcomeSubtitle: {
    fontSize: FontSizes.medium,
  },
  roleBadge: {
    paddingHorizontal: Spacing.medium,
    paddingVertical: Spacing.small,
    borderRadius: BorderRadius.medium,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: FontSizes.small,
    fontWeight: 'bold',
  },
  statsSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSizes.large,
    fontWeight: 'bold',
    marginBottom: Spacing.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.medium,
  },
  cardsSection: {
    marginBottom: Spacing.xl,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.medium,
  },
  dashboardCard: {
    flex: 1,
    minWidth: '45%',
    padding: Spacing.medium,
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
    alignItems: 'center',
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.medium,
  },
  cardIconText: {
    fontSize: FontSizes.xl,
  },
  cardTitle: {
    fontSize: FontSizes.medium,
    fontWeight: 'bold',
    marginBottom: Spacing.tiny,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: FontSizes.small,
    textAlign: 'center',
  },
  logoutSection: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  logoutButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.medium,
    borderRadius: BorderRadius.medium,
    ...Shadows.small,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.medium,
    fontWeight: 'bold',
  },
  closeModalButton: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    paddingVertical: Spacing.medium,
    borderRadius: BorderRadius.medium,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.medium,
    fontWeight: 'bold',
  },
  modalFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

interface StatCardProps {
  stat: StatItem;
  backgroundColor: string;
  borderColor: string;
}

const StatCard = React.memo(({ stat, backgroundColor, borderColor }: StatCardProps) => (
  <View style={[styles.statCardBase, { backgroundColor, borderColor }, Shadows.small]}>
    <Text style={[styles.statValueBase, { color: stat.color }]}>{stat.value}</Text>
    <Text style={[styles.statLabelBase]}>{stat.label}</Text>
  </View>
));

interface DashboardCardProps {
  card: DashboardCardItem;
  cardBackground: string;
  borderColor: string;
  onPress: () => void;
}

const DashboardCard = React.memo(({ card, cardBackground, borderColor, onPress }: DashboardCardProps) => (
  <TouchableOpacity
    style={[styles.dashboardCard, { backgroundColor: cardBackground, borderColor }, Shadows.small]}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <View style={[styles.cardIcon, { backgroundColor: card.color + '20' }] }>
      <Text style={styles.cardIconText}>{card.icon}</Text>
    </View>
    <Text style={styles.cardTitle}>{card.title}</Text>
    <Text style={styles.cardDescription}>{card.description}</Text>
  </TouchableOpacity>
));

const stylesWithMemoExtensions = StyleSheet.create({
  statCardBase: {
    flex: 1,
    minWidth: '45%',
    padding: Spacing.medium,
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValueBase: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    marginBottom: Spacing.tiny,
  },
  statLabelBase: {
    fontSize: FontSizes.small,
    textAlign: 'center',
    color: Colors.light.textSecondary,
  },
});

Object.assign(styles, stylesWithMemoExtensions);