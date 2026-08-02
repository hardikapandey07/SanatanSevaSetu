import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { parseTapTarget } from '@/constants/push';
import { Spacing } from '@/constants/theme';
import { useT } from '@/i18n/LanguageContext';

const BRAND = {
  primary: '#E8731C',
  primaryDark: '#C95A0E',
  bg: '#F7F4EE',
  card: '#FFFFFF',
  border: '#EFE7D7',
  text: '#1F1A14',
  textSecondary: '#6B6258',
  iconBg: '#FFF1DE',
};

function formatFull(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

export default function NotificationDetailScreen() {
  const t = useT();
  const { title, body, created_at, data: dataStr } = useLocalSearchParams<{
    id: string;
    title: string;
    body: string;
    created_at: string;
    data: string;
  }>();

  const parsedData: Record<string, string> = (() => {
    try { return dataStr ? JSON.parse(dataStr) : {}; } catch { return {}; }
  })();

  const target = parseTapTarget(parsedData);
  // Only show action button if it routes somewhere meaningful (not the default /notifications fallback)
  const hasAction = target && !(target.kind === 'route' && target.pathname === '/notifications');

  const handleAction = () => {
    if (!target) return;
    if (target.kind === 'url') { Linking.openURL(target.url).catch(() => {}); return; }
    router.push({ pathname: target.pathname, params: target.params } as never);
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
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
            <SymbolView
              name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
              tintColor="#FFFFFF"
              size={18}
            />
          </Pressable>
          <ThemedText style={styles.headerTitle}>{t('notifications')}</ThemedText>
          <View style={{ width: 32 }} />
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Icon + timestamp */}
        <View style={styles.iconRow}>
          <View style={styles.iconWrap}>
            <SymbolView
              name={{ ios: 'bell.badge.fill', android: 'notifications_active', web: 'notifications_active' }}
              tintColor={BRAND.primary}
              size={28}
            />
          </View>
          {!!created_at && (
            <ThemedText style={styles.timestamp}>{formatFull(created_at)}</ThemedText>
          )}
        </View>

        {/* Card */}
        <View style={styles.card}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <View style={styles.divider} />
          <ThemedText style={styles.body}>{body}</ThemedText>
        </View>

        {/* Action button — only shown when notification carries a deep-link */}
        {hasAction && (
          <Pressable
            onPress={handleAction}
            style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}>
            <LinearGradient
              colors={[BRAND.primary, BRAND.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionGradient}>
              <ThemedText style={styles.actionText}>
                {target?.kind === 'url' ? 'Open Link' : 'View Details'}
              </ThemedText>
              <SymbolView
                name={{ ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }}
                tintColor="#FFFFFF"
                size={16}
              />
            </LinearGradient>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },
  header: { paddingBottom: Spacing.three },
  headerInner: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.three, paddingTop: Spacing.two,
  },
  backBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontSize: 18, fontWeight: '800', color: '#FFFFFF',
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: BRAND.iconBg,
    alignItems: 'center', justifyContent: 'center',
  },
  timestamp: { fontSize: 12, color: BRAND.textSecondary, flex: 1 },
  card: {
    backgroundColor: BRAND.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BRAND.border,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  title: { fontSize: 17, fontWeight: '800', color: BRAND.text, lineHeight: 24 },
  divider: { height: 1, backgroundColor: BRAND.border },
  body: { fontSize: 15, color: BRAND.text, lineHeight: 24 },
  actionBtn: { borderRadius: 14, overflow: 'hidden', marginTop: Spacing.two },
  actionGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16,
  },
  actionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.85 },
});
