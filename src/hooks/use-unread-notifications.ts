import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { ApiService, type UserNotification } from '@/constants/api';
import { addPushListeners } from '@/constants/push';

export const NOTIF_LAST_READ_KEY = 'notif.lastReadAt';
export const NOTIF_CLEARED_BEFORE_KEY = 'notif.clearedBefore';

export function isNotificationUnread(n: UserNotification, lastReadAt: string | null): boolean {
  return !lastReadAt || new Date(n.created_at) > new Date(lastReadAt);
}

/** Unread notification count, kept in sync with the notifications screen's read/cleared markers. */
export function useUnreadNotificationsCount() {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const [{ items }, [[, read], [, cleared]]] = await Promise.all([
        ApiService.getMyNotifications(1, 50),
        AsyncStorage.multiGet([NOTIF_LAST_READ_KEY, NOTIF_CLEARED_BEFORE_KEY]),
      ]);
      const visible: UserNotification[] = cleared
        ? items.filter(n => new Date(n.created_at) > new Date(cleared))
        : items;
      setCount(visible.filter(n => isNotificationUnread(n, read)).length);
    } catch {
      // keep the last known count on failure
    }
  }, []);

  useEffect(() => {
    refresh();
    const removeListeners = addPushListeners({ onReceived: () => refresh() });
    return removeListeners;
  }, [refresh]);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  return count;
}
