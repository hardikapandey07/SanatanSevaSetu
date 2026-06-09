import { Stack, ThemeProvider, DarkTheme, DefaultTheme } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { useColorScheme, View } from 'react-native';

import { SplashOverlay } from '@/components/splash-overlay';
import { LanguageProvider } from '@/i18n/LanguageContext';

// Keep the native splash visible until our JS splash has mounted.
ExpoSplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [splashDone, setSplashDone] = useState(false);

  const onLayoutReady = useCallback(() => {
    // First frame is ready — hand off from native splash to the JS splash overlay.
    ExpoSplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    onLayoutReady();
  }, [onLayoutReady]);

  return (
    <LanguageProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1 }}>
          <Stack
            screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFFFFF' } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="register" />
            <Stack.Screen name="otp-verification" />
            <Stack.Screen name="pandit-register" />
            <Stack.Screen name="mandir-register" />
            <Stack.Screen name="pandit-search" />
            <Stack.Screen name="pandit-profile" />
            <Stack.Screen name="temple-search" />
            <Stack.Screen name="healing" />
            <Stack.Screen name="sanskrit-learning" />
            <Stack.Screen name="book-pooja" />
            <Stack.Screen name="payment" />
            <Stack.Screen name="my-bookings" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="suggestion" />
            <Stack.Screen name="language-settings" />
            <Stack.Screen name="(tabs)" />
          </Stack>
          {!splashDone && <SplashOverlay onFinish={() => setSplashDone(true)} />}
        </View>
      </ThemeProvider>
    </LanguageProvider>
  );
}
