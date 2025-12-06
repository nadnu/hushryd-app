import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router, usePathname } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StatusBar, StyleSheet, Text, View } from 'react-native';
import HushRydLogoImage from '../components/HushRydLogoImage';
import Colors from '../constants/Colors';
import { BorderRadius, FontSizes, Spacing } from '../constants/Design';
import { useColorScheme } from '../components/useColorScheme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const carAnim = useRef(new Animated.Value(-width * 0.6)).current;
  const roadAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(roadAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      { resetBeforeIteration: true }
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.sequence([
      Animated.timing(carAnim, {
        toValue: width * 0.18,
        duration: 1400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const timer = setTimeout(() => {
      if (pathname === '/splash') {
        router.replace('/(tabs)/');
      }
    }, 3400); // Total animation time

    return () => clearTimeout(timer);
  }, [pathname]);

  const roadTranslate = roadAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -120],
  });

  const bounceTranslate = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      {/* Background Gradient */}
      <LinearGradient
        colors={['#32CD32', '#228B22', '#006400']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Animated Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim },
            ],
          },
        ]}
      >
        {/* Road with moving car */}
        <View style={styles.roadSection}>
          <View style={styles.roadBackground}>
            <Animated.View
              style={[
                styles.roadStripe,
                {
                  transform: [{ translateX: roadTranslate }],
                },
              ]}
            />
          </View>
          <Animated.View
            style={[
              styles.carContainer,
              {
                transform: [
                  { translateX: carAnim },
                  { translateY: bounceTranslate },
                ],
              },
            ]}
          >
            <View style={styles.carBody}>
              <FontAwesome name="car" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.carLight} />
          </Animated.View>
        </View>

        {/* Logo Container */}
        <View style={styles.logoContainer}>
          <HushRydLogoImage
            size="large"
            showBackground={false}
            shadow={true}
          />
        </View>

        {/* App Title */}
        <Text style={[styles.appTitle, { color: '#FFFFFF' }]}>HushRyd</Text>
        <Text style={[styles.appSubtitle, { color: 'rgba(255,255,255,0.9)' }]}>Your Ride, Your Way</Text>

        {/* Tagline */}
        <Text style={[styles.tagline, { color: 'rgba(255,255,255,0.85)' }]}>
          Travel across AP, Telangana & Karnataka{'\n'}with shared & private rides
        </Text>

        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDots}>
            <Animated.View style={[styles.dot, { opacity: fadeAnim, backgroundColor: 'rgba(255,255,255,0.6)' }]} />
            <Animated.View style={[styles.dot, { opacity: fadeAnim, backgroundColor: 'rgba(255,255,255,0.6)' }]} />
            <Animated.View style={[styles.dot, { opacity: fadeAnim, backgroundColor: 'rgba(255,255,255,0.6)' }]} />
          </View>
        </View>
      </Animated.View>

      {/* Bottom Decoration */}
      <View style={styles.bottomDecoration}>
        <View style={[styles.decorativeLine, { backgroundColor: 'rgba(255,255,255,0.4)' }]} />
        <Text style={[styles.versionText, { color: 'rgba(255,255,255,0.7)' }]}>Version 1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.large,
  },
  logoContainer: {
    marginBottom: Spacing.large,
    alignItems: 'center',
  },
  roadSection: {
    width: '100%',
    height: 120,
    marginBottom: Spacing.large,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  roadBackground: {
    height: 50,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(0,0,0,0.25)',
    overflow: 'hidden',
    position: 'relative',
  },
  roadStripe: {
    position: 'absolute',
    top: '50%',
    left: 0,
    width: '200%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  carContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
  },
  carBody: {
    width: 80,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  carLight: {
    position: 'absolute',
    right: -18,
    top: 18,
    width: 30,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 215, 0, 0.6)',
    transform: [{ skewX: '-20deg' }],
  },
  appTitle: {
    fontSize: FontSizes.extraLarge * 1.5,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: Spacing.small,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 2,
  },
  appSubtitle: {
    fontSize: FontSizes.large,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: Spacing.large,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tagline: {
    fontSize: FontSizes.medium,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.extraLarge * 2,
    paddingHorizontal: Spacing.medium,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: Spacing.extraLarge,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  bottomDecoration: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  decorativeLine: {
    width: 60,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: Spacing.small,
  },
  versionText: {
    fontSize: FontSizes.tiny,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
});
