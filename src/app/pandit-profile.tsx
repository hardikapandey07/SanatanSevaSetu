import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { type Pandit } from '@/constants/api';
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
  avatarBg: '#FFE7CF',
  verifiedBg: '#D1FAE5',
  verifiedText: '#15803D',
};

export default function PanditProfileScreen() {
  const t = useT();
  const params = useLocalSearchParams();

  // Parse pandit data passed from pandit-search
  let pandit: Pandit | null = null;
  try {
    if (params.data) pandit = JSON.parse(params.data as string) as Pandit;
  } catch {}

  const initials = pandit
    ? pandit.Name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const specialityLabel = pandit?.Specialities[0]
    ? pandit.Specialities[0].SubSpecialityName
      ? `${pandit.Specialities[0].ParentCategoryName} · ${pandit.Specialities[0].SubSpecialityName}`
      : pandit.Specialities[0].ParentCategoryName
    : '—';

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
            <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} tintColor="#FFFFFF" size={18} />
          </Pressable>
          <ThemedText style={styles.headerTitle}>{t('panditProfile')}</ThemedText>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <ThemedText style={styles.avatarText}>{initials}</ThemedText>
          </View>
          {pandit?.IsVerify && (
            <View style={styles.verifiedBadge}>
              <ThemedText style={styles.verifiedText}>✓ Verified Pandit</ThemedText>
            </View>
          )}
        </View>

        {/* Name + Speciality */}
        <View style={styles.nameSection}>
          <ThemedText style={styles.name}>{pandit?.Name ?? '—'}</ThemedText>
          <ThemedText style={styles.speciality}>{specialityLabel}</ThemedText>
          <View style={styles.langRow}>
            {pandit?.Languages.map(lang => (
              <View key={lang} style={styles.langChip}>
                <ThemedText style={styles.langChipText}>{lang}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* Details */}
        <View style={styles.card}>
          <InfoRow label={t('experienceLabel')} value={pandit?.ExpInYears ?? '—'} />
          <InfoRow label={t('juniorPandits')} value={pandit ? `${pandit.PanditsUnderCount}` : '—'} />
          <InfoRow label={t('locationPinCode')} value={pandit?.PinCode ?? '—'} />
          <InfoRow label="Status" value={pandit?.IsPaid ? 'Active' : 'Pending Payment'} valueColor={pandit?.IsPaid ? '#15803D' : '#DC2626'} />
        </View>

        {/* All Specialities */}
        {pandit && pandit.Specialities.length > 0 && (
          <View style={styles.card}>
            <ThemedText style={styles.sectionTitle}>{t('specialityLabel')}</ThemedText>
            {pandit.Specialities.map((s, i) => (
              <View key={i} style={styles.specialityRow}>
                <View style={styles.specialityDot} />
                <View>
                  <ThemedText style={styles.specialityParent}>{s.ParentCategoryName}</ThemedText>
                  {s.SubSpecialityName ? (
                    <ThemedText style={styles.specialitySub}>{s.SubSpecialityName}</ThemedText>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Contact */}
        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>{t('contactInfo')}</ThemedText>
          <View style={styles.contactRow}>
            <View style={styles.contactIcon}>
              <SymbolView name={{ ios: 'phone.fill', android: 'call', web: 'call' }} tintColor={BRAND.primary} size={16} />
            </View>
            <ThemedText style={styles.contactValue}>+91 {pandit?.ContactNo ?? '—'}</ThemedText>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionButtons}>
          <Pressable style={({ pressed }) => [styles.contactBtn, pressed && styles.pressed]}>
            <SymbolView name={{ ios: 'phone.fill', android: 'call', web: 'call' }} tintColor="#FFFFFF" size={18} />
            <ThemedText style={styles.contactBtnText}>{t('contact')}</ThemedText>
          </Pressable>
          <Pressable
            onPress={() => router.push('/book-pooja')}
            style={({ pressed }) => [styles.bookBtn, pressed && styles.pressed]}>
            <SymbolView name={{ ios: 'calendar', android: 'event', web: 'event' }} tintColor="#FFFFFF" size={18} />
            <ThemedText style={styles.bookBtnText}>{t('bookService')}</ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.infoRow}>
      <ThemedText style={styles.infoLabel}>{label}</ThemedText>
      <ThemedText style={[styles.infoValue, valueColor ? { color: valueColor } : null]}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },
  header: { paddingBottom: Spacing.three },
  headerInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.three, paddingTop: Spacing.two, gap: 12 },
  backBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.five },

  avatarSection: { alignItems: 'center', paddingVertical: Spacing.four, backgroundColor: BRAND.card, borderBottomWidth: 1, borderBottomColor: BRAND.border, gap: 10 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: BRAND.avatarBg, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: BRAND.primary },
  avatarText: { fontSize: 32, fontWeight: '800', color: BRAND.primary },
  verifiedBadge: { backgroundColor: BRAND.verifiedBg, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  verifiedText: { fontSize: 12, fontWeight: '700', color: BRAND.verifiedText },

  nameSection: { alignItems: 'center', paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, backgroundColor: BRAND.card, gap: 6 },
  name: { fontSize: 22, fontWeight: '800', color: BRAND.text },
  speciality: { fontSize: 13, color: BRAND.textSecondary, textAlign: 'center' },
  langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 4 },
  langChip: { backgroundColor: '#FFF1DE', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  langChipText: { fontSize: 12, fontWeight: '600', color: BRAND.primary },

  card: { backgroundColor: BRAND.card, borderWidth: 1, borderColor: BRAND.border, borderRadius: 12, padding: Spacing.three, marginHorizontal: Spacing.three, marginTop: Spacing.three, gap: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: BRAND.text },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: BRAND.border },
  infoLabel: { fontSize: 13, color: BRAND.textSecondary, fontWeight: '600' },
  infoValue: { fontSize: 14, fontWeight: '700', color: BRAND.text },

  specialityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  specialityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: BRAND.primary, marginTop: 5 },
  specialityParent: { fontSize: 14, fontWeight: '700', color: BRAND.text },
  specialitySub: { fontSize: 12, color: BRAND.textSecondary, marginTop: 2 },

  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  contactIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(232,115,28,0.1)', alignItems: 'center', justifyContent: 'center' },
  contactValue: { flex: 1, fontSize: 14, fontWeight: '600', color: BRAND.text },

  actionButtons: { flexDirection: 'row', gap: Spacing.two, marginHorizontal: Spacing.three, marginTop: Spacing.four, paddingBottom: Spacing.four },
  contactBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: BRAND.primary, borderRadius: 12, paddingVertical: 14 },
  contactBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  bookBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: BRAND.primaryDark, borderRadius: 12, paddingVertical: 14 },
  bookBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.85 },
});
