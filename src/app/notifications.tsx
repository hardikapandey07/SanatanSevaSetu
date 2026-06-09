import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useT } from '@/i18n/LanguageContext';
import type { TranslationKey } from '@/i18n/translations';

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

type NotificationItem = {
  id: string;
  icon: { ios: string; android: string; web: string };
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  time: string;
  category: 'service' | 'event';
  isUnread: boolean;
};

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    icon: { ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' },
    titleKey: 'notifPoojaReminder',
    descriptionKey: 'notifPoojaReminderDesc',
    time: '2 hrs ago',
    category: 'service',
    isUnread: true,
  },
  {
    id: '2',
    icon: { ios: 'building.2.fill', android: 'temple_hindu', web: 'temple_hindu' },
    titleKey: 'notifTempleUpdate',
    descriptionKey: 'notifTempleUpdateDesc',
    time: '3 days ago',
    category: 'service',
    isUnread: false,
  },
  {
    id: '3',
    icon: { ios: 'calendar.badge.plus', android: 'event', web: 'event' },
    titleKey: 'notifEventStarting',
    descriptionKey: 'notifEventStartingDesc',
    time: '5 hrs ago',
    category: 'event',
    isUnread: true,
  },
  {
    id: '4',
    icon: { ios: 'book.circle.fill', android: 'school', web: 'school' },
    titleKey: 'notifWebinar',
    descriptionKey: 'notifWebinarDesc',
    time: '4 days ago',
    category: 'event',
    isUnread: false,
  },
  {
    id: '5',
    icon: { ios: 'bell.badge.fill', android: 'notifications_active', web: 'notifications_active' },
    titleKey: 'notifBookingConfirmed',
    descriptionKey: 'notifBookingConfirmedDesc',
    time: '1 week ago',
    category: 'service',
    isUnread: false,
  },
];

export default function NotificationsScreen() {
  const t = useT();
  const unreadCount = NOTIFICATIONS.filter(n => n.isUnread).length;

  const handleMarkAllRead = () => {
    // Handle mark all as read
  };

  const handleClearAll = () => {
    // Handle clear all notifications
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
        showsVerticalScrollIndicator={false}>
        {NOTIFICATIONS.length > 0 ? (
          <>
            <View style={styles.categorySection}>
              <ThemedText style={styles.categoryTitle}>{t('serviceReminders')}</ThemedText>
              {NOTIFICATIONS.filter(n => n.category === 'service').map(notification => (
                <NotificationCard key={notification.id} notification={notification} t={t} />
              ))}
            </View>

            <View style={styles.categorySection}>
              <ThemedText style={styles.categoryTitle}>{t('eventsAndFestivals')}</ThemedText>
              {NOTIFICATIONS.filter(n => n.category === 'event').map(notification => (
                <NotificationCard key={notification.id} notification={notification} t={t} />
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

function NotificationCard({ notification, t }: { notification: NotificationItem; t: (key: TranslationKey) => string }) {
  return (
    <Pressable style={({ pressed }) => [styles.notifCard, notification.isUnread && styles.unread, pressed && styles.pressed]}>
      <View style={styles.iconWrap}>
        <View style={[styles.icon, notification.isUnread && styles.iconUnread]}>
          <SymbolView
            name={notification.icon}
            tintColor={BRAND.primary}
            size={20}
          />
        </View>
        {notification.isUnread && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.content}>
        <ThemedText style={[styles.title, notification.isUnread && styles.titleUnread]}>
          {t(notification.titleKey)}
        </ThemedText>
        <ThemedText style={styles.description}>{t(notification.descriptionKey)}</ThemedText>
        <ThemedText style={styles.time}>{notification.time}</ThemedText>
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
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
  categoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: BRAND.text,
    marginBottom: Spacing.two,
    paddingHorizontal: 4,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 12,
    padding: Spacing.three,
    marginBottom: Spacing.two,
    gap: 12,
  },
  unread: {
    backgroundColor: BRAND.unreadBg,
    borderColor: BRAND.primary,
  },
  iconWrap: { position: 'relative', width: 44, height: 44 },
  icon: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: BRAND.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconUnread: {
    backgroundColor: 'rgba(232, 115, 28, 0.15)',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#DC2626',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  content: { flex: 1, gap: 4 },
  title: { fontSize: 14, fontWeight: '600', color: BRAND.text },
  titleUnread: { fontWeight: '700' },
  description: { fontSize: 13, color: BRAND.textSecondary, lineHeight: 18 },
  time: { fontSize: 11, color: BRAND.textSecondary, marginTop: 2 },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: { fontSize: 16, fontWeight: '600', color: BRAND.textSecondary },
  clearAllBtn: {
    marginTop: Spacing.three,
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearAllText: { color: BRAND.textSecondary, fontSize: 14, fontWeight: '600' },
  pressed: { opacity: 0.85 },
});
