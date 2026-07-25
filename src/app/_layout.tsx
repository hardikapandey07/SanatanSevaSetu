import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter } from "expo-router";
import * as ExpoSplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import { useColorScheme, View } from "react-native";

import { SplashOverlay } from "@/components/splash-overlay";
import { TokenManager } from "@/constants/api";
import { LanguageProvider } from "@/i18n/LanguageContext";

// Keep the native splash visible until our JS splash takes over.
ExpoSplashScreen.preventAutoHideAsync().catch(() => {});

function AuthRedirect({ splashDone }: { splashDone: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!splashDone) return;
    TokenManager.isLoggedIn().then(loggedIn => {
      if (loggedIn) router.replace('/(tabs)/home');
    });
  }, [splashDone, router]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [splashDone, setSplashDone] = useState(false);

  const handleSplashFinish = useCallback(() => {
    ExpoSplashScreen.hideAsync().catch(() => {});
    setSplashDone(true);
  }, []);

  return (
    <LanguageProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <View
          style={{ flex: 1, width: "100%", maxWidth: 800, alignSelf: "center" }}
        >
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#FFFFFF" },
            }}
          >
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
            <Stack.Screen name="service-detail" />
            <Stack.Screen name="payment" />
            <Stack.Screen name="my-bookings" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="suggestion" />
            <Stack.Screen name="language-settings" />
            <Stack.Screen name="reward-referral" />
            <Stack.Screen name="event-detail" />
            <Stack.Screen name="webinar-watch" />
            <Stack.Screen name="broadcasts-list" />
            <Stack.Screen name="group-puja-list" />
            <Stack.Screen name="group-puja-detail" />
            <Stack.Screen name="(tabs)" />
          </Stack>
          <AuthRedirect splashDone={splashDone} />
          {!splashDone && (
            <SplashOverlay onFinish={handleSplashFinish} />
          )}
        </View>
      </ThemeProvider>
    </LanguageProvider>
  );
}
