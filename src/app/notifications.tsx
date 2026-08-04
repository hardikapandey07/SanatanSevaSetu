import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ApiService, type UserNotification } from '@/constants/api';
import { Spacing } from '@/constants/theme';
import { useLanguage, useT, useTranslatedList } from '@/i18n/LanguageContext';
import { isNotificationUnread, NOTIF_CLEARED_BEFORE_KEY, NOTIF_LAST_READ_KEY } from '@/hooks/use-unread-notifications';

const BRAND = {
  primary: '#E8731C',
  primaryDark: '#C95A0E',
  bg: '#F7F4EE',
  card: '#FFFFFF',
  border: '#EFE7D7',
  text: '#1F1A14',
  textSecondary: '#6B6258',
  iconBg: '#FFF1DE',
  unreadBg: '#FFF8F0',
};

const LAST_READ_KEY = NOTIF_LAST_READ_KEY;
const CLEARED_BEFORE_KEY = NOTIF_CLEARED_BEFORE_KEY;

const ICON_EVENT = { ios: 'calendar.badge.plus', android: 'event', web: 'event' } as const;
const ICON_DEFAULT = { ios: 'bell.badge.fill', android: 'notifications_active', web: 'notifications_active' } as const;

type SymbolName = React.ComponentProps<typeof SymbolView>['name'];

function formatWhen(iso: string, lang: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const sameDay = new Date().toDateString() === d.toDateString();
  return sameDay
    ? d.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString(lang, { day: 'numeric', month: 'short' });
}

export default function NotificationsScreen() {
  const t = useT();
  const { lang } = useLanguage();

  const [raw, setRaw] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [failed, setFailed] = useState(false);
  const [lastReadAt, setLastReadAt] = useState<string | null>(null);
  const [clearedBefore, setClearedBefore] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [{ items }, [[, read], [, cleared]]] = await Promise.all([
        ApiService.getMyNotifications(1, 50),
        AsyncStorage.multiGet([LAST_READ_KEY, CLEARED_BEFORE_KEY]),
      ]);
      setRaw(items);
      setLastReadAt(read);
      setClearedBefore(cleared);
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(() => { setRefreshing(true); load(); }, [load]);

  const visible = clearedBefore
    ? raw.filter(n => new Date(n.created_at) > new Date(clearedBefore))
    : raw;

  const translated = useTranslatedList(visible, ['title', 'body']);

  const isUnread = (n: UserNotification) => isNotificationUnread(n, lastReadAt);
  const unreadCount = visible.filter(isUnread).length;

  const handleMarkAllRead = async () => {
    const now = new Date().toISOString();
    setLastReadAt(now);
    await AsyncStorage.setItem(LAST_READ_KEY, now);
  };

  const handleClearAll = async () => {
    const now = new Date().toISOString();
    setClearedBefore(now);
    await AsyncStorage.setItem(CLEARED_BEFORE_KEY, now);
  };

  const handleOpen = (n: UserNotification) => {
    router.push({
      pathname: '/notification-detail',
      params: {
        id: n.id,
        title: n.title,
        body: n.body,
        created_at: n.created_at,
        data: JSON.stringify(n.data ?? {}),
      },
    } as never);
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[BRAND.primary, BRAND.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerInner}>
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Back"
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
            <SymbolView
              name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
              tintColor="#FFFFFF"
              size={18}
            />
          </Pressable>
          <View style={styles.headerTitle}>
            <ThemedText style={styles.headerTitleText}>{t('notifications')}</ThemedText>
            {unreadCount > 0 && (
              <ThemedText style={styles.unreadBadge}>{unreadCount} {t('unread')}</ThemedText>
            )}
          </View>
          <Pressable
            onPress={handleMarkAllRead}
            accessibilityLabel="Mark all as read"
            style={({ pressed }) => [pressed && styles.pressed]}>
            <ThemedText style={styles.headerAction}>{t('markAllRead')}</ThemedText>
          </Pressable>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BRAND.primary} />
        }>
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color={BRAND.primary} />
          </View>
        ) : failed ? (
          <View style={styles.emptyState}>
            <SymbolView
              name={{ ios: 'wifi.slash', android: 'wifi_off', web: 'wifi_off' }}
              tintColor={BRAND.textSecondary}
              size={48}
            />
            <Pressable
              onPress={() => { setLoading(true); load(); }}
              style={({ pressed }) => [styles.clearAllBtn, pressed && styles.pressed]}>
              <ThemedText style={styles.clearAllText}>{t('retry')}</ThemedText>
            </Pressable>
          </View>
        ) : visible.length > 0 ? (
          <>
            <View style={styles.categorySection}>
              {visible.map((n, i) => (
                <NotificationCard
                  key={n.id}
                  title={translated[i]?.title ?? n.title}
                  body={translated[i]?.body ?? n.body}
                  when={formatWhen(n.created_at, lang)}
                  icon={n.data?.category === 'event' ? ICON_EVENT : ICON_DEFAULT}
                  unread={isUnread(n)}
                  onPress={() => handleOpen(n)}
                />
              ))}
            </View>
            <Pressable
              onPress={handleClearAll}
              style={({ pressed }) => [styles.clearAllBtn, pressed && styles.pressed]}>
              <ThemedText style={styles.clearAllText}>{t('clearAll')}</ThemedText>
            </Pressable>
          </>
        ) : (
          <View style={styles.emptyState}>
            <SymbolView
              name={{ ios: 'bell.slash', android: 'notifications_off', web: 'notifications_off' }}
              tintColor={BRAND.textSecondary}
              size={48}
            />
            <ThemedText style={styles.emptyText}>{t('noNotifications')}</ThemedText>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function NotificationCard({
  title, body, when, icon, unread, onPress,
}: {
  title: string; body: string; when: string;
  icon: SymbolName; unread: boolean; onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.notifCard, unread && styles.unread, pressed && styles.pressed]}>
      <View style={styles.iconWrap}>
        <View style={[styles.icon, unread && styles.iconUnread]}>
          <SymbolView name={icon} tintColor={BRAND.primary} size={20} />
        </View>
        {unread && <View style={styles.unreadDot} />}
      </View>
      <View style={styles.content}>
        <ThemedText style={[styles.title, unread && styles.titleUnread]}>{title}</ThemedText>
        <ThemedText style={styles.description}>{body}</ThemedText>
        <ThemedText style={styles.time}>{when}</ThemedText>
      </View>
      <SymbolView
        name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
        tintColor={BRAND.textSecondary}
        size={16}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },
  header: { paddingBottom: Spacing.three },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    gap: 12,
  },
  backBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { flex: 1, gap: 2 },
  headerTitleText: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  unreadBadge: { fontSize: 11, color: '#FFE7CF' },
  headerAction: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
  },
  categorySection: { marginBottom: Spacing.four },
  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: BRAND.card, borderWidth: 1, borderColor: BRAND.border,
    borderRadius: 12, padding: Spacing.three, marginBottom: Spacing.two, gap: 12,
  },
  unread: { backgroundColor: BRAND.unreadBg, borderColor: BRAND.primary },
  iconWrap: { position: 'relative', width: 44, height: 44 },
  icon: {
    width: '100%', height: '100%', borderRadius: 12,
    backgroundColor: BRAND.iconBg, alignItems: 'center', justifyContent: 'center',
  },
  iconUnread: { backgroundColor: 'rgba(232, 115, 28, 0.15)' },
  unreadDot: {
    position: 'absolute', top: -2, right: -2,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#DC2626', borderWidth: 2, borderColor: '#FFFFFF',
  },
  content: { flex: 1, gap: 4 },
  title: { fontSize: 14, fontWeight: '600', color: BRAND.text },
  titleUnread: { fontWeight: '700' },
  description: { fontSize: 13, color: BRAND.textSecondary, lineHeight: 18 },
  time: { fontSize: 11, color: BRAND.textSecondary, marginTop: 2 },
  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 60, gap: 12,
  },
  emptyText: { fontSize: 16, fontWeight: '600', color: BRAND.textSecondary },
  clearAllBtn: { marginTop: Spacing.three, paddingVertical: 12, alignItems: 'center' },
  clearAllText: { color: BRAND.textSecondary, fontSize: 14, fontWeight: '600' },
  pressed: { opacity: 0.85 },
});
