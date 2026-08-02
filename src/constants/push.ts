// Talks to the FCM API. Uses expo-notifications only to obtain the
// native FCM token and to surface notifications -- delivery goes through our own
// server, not Expo's push service.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { STORAGE_KEYS } from './api';
import { PUSH_CONFIG } from './environment';

const LAST_TOKEN_KEY = 'push_last_token';

// Controls what happens when a notification arrives while the app is FOREGROUND.
// Without this, Android silently swallows it -- the notification only appears
// when the app is backgrounded. Must be called at module scope, before render.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensurePermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  // Android 13+ and all iOS versions need an explicit runtime prompt.
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

/**
 * Idempotent -- safe to call on every app launch, and you should: FCM tokens
 * rotate on reinstall, app-data clear, and occasionally on their own.
 * Returns the FCM token, or null if push is unavailable (emulator, denied, etc).
 */
export async function registerForPush(userId?: string): Promise<string | null> {
  // TEMPORARY (testing): the isDevice guard is relaxed so a Play-Services-enabled
  // Android emulator can obtain a real FCM token. iOS simulators genuinely cannot
  // receive push, so they still bail. RESTORE the plain `if (!Device.isDevice)`
  // guard before team handoff.
  if (!Device.isDevice && Platform.OS === 'ios') {
    console.log('[push] skipped: iOS simulator cannot receive push');
    return null;
  }

  if (Platform.OS === 'android') {
    // Android 8+ drops notifications that have no channel.
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#E8731C',
    });
  }

  if (!(await ensurePermission())) {
    console.log('[push] permission denied by user');
    return null;
  }

  const resolvedUserId = userId ?? (await AsyncStorage.getItem(STORAGE_KEYS.USER_ID));
  if (!resolvedUserId) {
    console.log('[push] no user_id yet -- call again after login');
    return null;
  }

  const { data: fcmToken } = await Notifications.getDevicePushTokenAsync();

  const r = await fetch(`${PUSH_CONFIG.BASE_URL}/api/v1/devices/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': PUSH_CONFIG.API_KEY },
    body: JSON.stringify({
      user_id: resolvedUserId,
      fcm_token: fcmToken,
      platform: Platform.OS,
    }),
  });

  if (!r.ok) {
    console.warn('[push] register failed:', r.status, await r.text());
    return null;
  }

  // Remembered so logout can unregister this exact token.
  await AsyncStorage.setItem(LAST_TOKEN_KEY, fcmToken);
  console.log('[push] registered', fcmToken.slice(0, 20) + '...');
  return fcmToken;
}

/**
 * Call on logout. Without this, the next person to log in on this device keeps
 * receiving the previous user's notifications.
 */
export async function unregisterForPush(): Promise<void> {
  const fcmToken = await AsyncStorage.getItem(LAST_TOKEN_KEY);
  if (!fcmToken) return;

  try {
    await fetch(`${PUSH_CONFIG.BASE_URL}/api/v1/devices/unregister`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': PUSH_CONFIG.API_KEY },
      body: JSON.stringify({ fcm_token: fcmToken }),
    });
  } catch (e) {
    console.warn('[push] unregister failed (token will be pruned on next dead send)', e);
  }
  await AsyncStorage.removeItem(LAST_TOKEN_KEY);
}

/**
 * Wires up the two things you can react to:
 *   onReceived -- notification arrived while app was open
 *   onTapped   -- user tapped a notification (app was backgrounded or closed)
 * Returns a cleanup function; call it from useEffect's teardown.
 */
export function addPushListeners(opts: {
  onReceived?: (data: Record<string, any>) => void;
  onTapped?: (data: Record<string, any>) => void;
}): () => void {
  const received = Notifications.addNotificationReceivedListener(event => {
    opts.onReceived?.(event.request.content.data ?? {});
  });

  const tapped = Notifications.addNotificationResponseReceivedListener(event => {
    opts.onTapped?.(event.notification.request.content.data ?? {});
  });

  return () => {
    received.remove();
    tapped.remove();
  };
}

/**
 * What tapping a notification should do, decoded from its `data` payload.
 * FCM only carries strings, so `params` arrives JSON-encoded.
 */
export type PushTapTarget =
  | { kind: 'url'; url: string }
  | { kind: 'route'; pathname: string; params: Record<string, string> };

export function parseTapTarget(data: Record<string, any> | null | undefined): PushTapTarget | null {
  if (!data) return null;

  const url = typeof data.url === 'string' ? data.url.trim() : '';
  if (url) return { kind: 'url', url };

  const pathname = typeof data.route === 'string' ? data.route.trim() : '';
  // No route specified — default to notifications page so the user sees what arrived.
  if (!pathname) return { kind: 'route', pathname: '/notifications', params: {} };

  let params: Record<string, string> = {};
  if (typeof data.params === 'string' && data.params) {
    try {
      const parsed = JSON.parse(data.params);
      if (parsed && typeof parsed === 'object') params = parsed;
    } catch {
      // malformed params — still open the screen
    }
  } else if (data.params && typeof data.params === 'object') {
    params = data.params;
  }

  return { kind: 'route', pathname, params };
}

const HANDLED_TAP_KEY = 'push_last_handled_tap';

/**
 * The target of a tap that launched the app from a killed state.
 * De-duplicates by notification identifier so it doesn't re-navigate on every cold start.
 */
export async function getInitialTapTarget(): Promise<PushTapTarget | null> {
  try {
    const response = await Notifications.getLastNotificationResponseAsync();
    if (!response) return null;

    const identifier = response.notification.request.identifier;
    if (identifier) {
      const alreadyHandled = await AsyncStorage.getItem(HANDLED_TAP_KEY);
      if (alreadyHandled === identifier) return null;
      await AsyncStorage.setItem(HANDLED_TAP_KEY, identifier);
    }

    return parseTapTarget(response.notification.request.content.data ?? {});
  } catch (e) {
    console.warn('[push] could not read the launching notification', e);
    return null;
  }
}
