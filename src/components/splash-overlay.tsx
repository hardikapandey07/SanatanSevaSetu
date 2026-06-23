import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useT } from '@/i18n/LanguageContext';

const BRAND = {
  primary: '#E8731C',
  bg: '#FFF6E9',
  text: '#1F1A14',
  textSecondary: '#6B6258',
  trackBg: '#F1E4CC',
};

type Props = {
  /** Total visible duration in ms. Defaults to 2000. */
  duration?: number;
  /** Called when the splash animation completes. */
  onFinish?: () => void;
};

export function SplashOverlay({ duration = 2000, onFinish }: Props) {
  const t = useT();
  const progress = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fade, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(progress, {
        toValue: 1,
        duration: duration - 350,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start(({ finished }) => {
      if (finished && onFinish) onFinish();
    });
  }, [duration, fade, onFinish, progress]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.content, { opacity: fade }]}>
        <View style={styles.logoWrap}>
          <Image
            source={require('@/assets/images/logo1.jpg')}
            style={styles.logo}
            contentFit="contain"
          />
        </View>

        <View style={styles.divider} />

        <ThemedText style={styles.tagline}>{t('splashTagline')}</ThemedText>
        <ThemedText style={styles.taglineNative}>{t('splashTaglineNative')}</ThemedText>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BRAND.bg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    width: '100%',
  },
  logoWrap: {
    width: 160,
    height: 160,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  logo: { width: '92%', height: '92%' },
  divider: {
    width: 80,
    height: 3,
    borderRadius: 2,
    backgroundColor: BRAND.primary,
    marginTop: 28,
  },
  tagline: {
    marginTop: 18,
    fontSize: 15,
    fontWeight: '700',
    color: BRAND.text,
    textAlign: 'center',
  },
  taglineNative: {
    marginTop: 6,
    fontSize: 13,
    color: BRAND.textSecondary,
    textAlign: 'center',
  },
  progressTrack: {
    marginTop: 28,
    width: '70%',
    height: 4,
    borderRadius: 2,
    backgroundColor: BRAND.trackBg,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: BRAND.primary,
    borderRadius: 2,
  },
});
