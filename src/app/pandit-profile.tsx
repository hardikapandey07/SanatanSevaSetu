import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
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
};

const PANDIT_DATA = {
  name: 'Pandit Ramesh Sharma',
  speciality: 'Vedic Rituals, Wedding Ceremonies',
  experience: 15,
  juniorPandits: 5,
  location: 'Delhi, 110001',
  phone: '+91 98765 43210',
  email: 'ramesh.sharma@example.com',
  bio: 'Experienced in conducting traditional Vedic ceremonies and rituals with deep knowledge of Sanskrit mantras.',
  reviews: 4.8,
  totalReviews: 124,
};

export default function PanditProfileScreen() {
  const t = useT();

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
          <ThemedText style={styles.headerTitle}>{t('panditProfile')}</ThemedText>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <SymbolView
              name={{ ios: 'person.fill', android: 'person', web: 'person' }}
              tintColor={BRAND.primary}
              size={60}
            />
          </View>
        </View>

        <View style={styles.nameSection}>
          <ThemedText style={styles.name}>{PANDIT_DATA.name}</ThemedText>
          <ThemedText style={styles.speciality}>{PANDIT_DATA.speciality}</ThemedText>

          <View style={styles.ratingRow}>
            <View style={styles.ratingContainer}>
              <SymbolView
                name={{ ios: 'star.fill', android: 'star', web: 'star' }}
                tintColor={BRAND.primary}
                size={14}
              />
              <ThemedText style={styles.rating}>{PANDIT_DATA.reviews}</ThemedText>
              <ThemedText style={styles.reviewCount}>({PANDIT_DATA.totalReviews})</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <InfoRow label={t('experience')} value={`${PANDIT_DATA.experience} Years`} />
          <InfoRow label={t('juniorPandits')} value={`${PANDIT_DATA.juniorPandits} Pandits`} />
          <InfoRow label={t('location')} value={PANDIT_DATA.location} />
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>{t('aboutPandit')}</ThemedText>
          <ThemedText style={styles.bioText}>{PANDIT_DATA.bio}</ThemedText>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>{t('contactInfo')}</ThemedText>
          <ContactRow
            icon={{ ios: 'phone.fill', android: 'call', web: 'call' }}
            value={PANDIT_DATA.phone}
          />
          <ContactRow
            icon={{ ios: 'envelope.fill', android: 'email', web: 'email' }}
            value={PANDIT_DATA.email}
          />
        </View>

        <View style={styles.actionButtons}>
          <Pressable style={({ pressed }) => [styles.contactBtn, pressed && styles.pressed]}>
            <SymbolView
              name={{ ios: 'phone.fill', android: 'call', web: 'call' }}
              tintColor="#FFFFFF"
              size={18}
            />
            <ThemedText style={styles.contactBtnText}>{t('contact')}</ThemedText>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.bookBtn, pressed && styles.pressed]}>
            <SymbolView
              name={{ ios: 'calendar', android: 'event', web: 'event' }}
              tintColor="#FFFFFF"
              size={18}
            />
            <ThemedText style={styles.bookBtnText}>{t('bookService')}</ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <ThemedText style={styles.infoLabel}>{label}</ThemedText>
      <ThemedText style={styles.infoValue}>{value}</ThemedText>
    </View>
  );
}

function ContactRow({
  icon,
  value,
}: {
  icon: { ios: string; android: string; web: string };
  value: string;
}) {
  return (
    <View style={styles.contactRow}>
      <View style={styles.contactIcon}>
        <SymbolView name={icon} tintColor={BRAND.primary} size={16} />
      </View>
      <ThemedText style={styles.contactValue}>{value}</ThemedText>
    </View>
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
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  scroll: { flex: 1 },
  scrollContent: {
    paddingBottom: Spacing.five,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
    backgroundColor: BRAND.card,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: BRAND.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    backgroundColor: BRAND.card,
    gap: 8,
  },
  name: { fontSize: 20, fontWeight: '800', color: BRAND.text },
  speciality: { fontSize: 13, color: BRAND.textSecondary, textAlign: 'center' },
  ratingRow: { marginTop: 8 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { fontSize: 14, fontWeight: '700', color: BRAND.primary },
  reviewCount: { fontSize: 13, color: BRAND.textSecondary },
  card: {
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 12,
    padding: Spacing.three,
    marginHorizontal: Spacing.three,
    marginTop: Spacing.three,
    gap: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: BRAND.text, marginBottom: 4 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  infoLabel: { fontSize: 13, color: BRAND.textSecondary, fontWeight: '600' },
  infoValue: { fontSize: 14, fontWeight: '700', color: BRAND.text },
  bioText: { fontSize: 13, color: BRAND.textSecondary, lineHeight: 20 },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  contactIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(232, 115, 28, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactValue: { flex: 1, fontSize: 14, fontWeight: '600', color: BRAND.text },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginHorizontal: Spacing.three,
    marginTop: Spacing.four,
    paddingBottom: Spacing.four,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: BRAND.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  contactBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  bookBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: BRAND.primaryDark,
    borderRadius: 12,
    paddingVertical: 14,
  },
  bookBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.85 },
});
