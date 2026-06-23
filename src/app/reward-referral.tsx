import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useT } from '@/i18n/LanguageContext';

const BRAND = {
  primary: '#E8731C',
  primaryDark: '#C95A0E',
  planBg: '#2D1F0E',
  planBorder: '#4A3520',
  bg: '#F7F4EE',
  card: '#FFFFFF',
  border: '#EFE7D7',
  text: '#1F1A14',
  textSecondary: '#6B6258',
  green: '#15803D',
  greenBg: '#D5F1DE',
};

const REFERRAL_CODE = 'SSS-RAJ-2025';
const REWARD_POINTS = 1240;
const POINTS_VALUE = 62;

type Transaction = { title: string; date: string; points: number };
const TRANSACTIONS: Transaction[] = [
  { title: 'Satyanarayan Pooja Booking', date: 'Aug 28', points: 120 },
  { title: 'Referred Friend Joined',     date: 'Aug 20', points: 500 },
  { title: 'Grihapravesh Booking',        date: 'Jul 15', points: 200 },
  { title: 'Profile Completed',           date: 'Jul 10', points: 50 },
  { title: 'First Booking Bonus',         date: 'Jul 8',  points: 370 },
];

export default function RewardReferralScreen() {
  const t = useT();

  const handleCopy = async () => {
    await Share.share({ message: REFERRAL_CODE });
  };

  const handleInvite = async () => {
    await Share.share({
      message: `Join Sanatan Seva Setu and get divine services at your fingertips! Use my referral code ${REFERRAL_CODE} to get started. Download now: https://sanatansevasetu.app`,
    });
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient
        colors={[BRAND.primary, BRAND.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerInner}>
          <View style={styles.headerRow}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
              <SymbolView
                name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
                tintColor="#FFFFFF"
                size={18}
              />
            </Pressable>
            <ThemedText style={styles.headerTitle}>{t('rewardAndReferral')}</ThemedText>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Points Card */}
        <View style={styles.pointsCard}>
          <ThemedText style={styles.pointsNumber}>{REWARD_POINTS.toLocaleString()}</ThemedText>
          <ThemedText style={styles.pointsLabel}>
            {t('rewardPoints')} ≈ ₹{POINTS_VALUE} {t('value')}
          </ThemedText>
          <Pressable
            style={({ pressed }) => [styles.redeemBtn, pressed && styles.pressed]}>
            <ThemedText style={styles.redeemBtnText}>{t('redeemPoints')}</ThemedText>
          </Pressable>
        </View>

        {/* Referral Code Card */}
        <View style={styles.referralCard}>
          <ThemedText style={styles.referralCardTitle}>{t('yourReferralCode')}</ThemedText>

          <View style={styles.codeRow}>
            <ThemedText style={styles.codeText}>{REFERRAL_CODE}</ThemedText>
            <Pressable
              onPress={handleCopy}
              style={({ pressed }) => [styles.copyBtn, pressed && styles.pressed]}>
              <SymbolView
                name={{ ios: 'doc.on.doc', android: 'content_copy', web: 'content_copy' }}
                tintColor="#FFFFFF"
                size={14}
              />
              <ThemedText style={styles.copyBtnText}>{t('copy')}</ThemedText>
            </Pressable>
          </View>

          <ThemedText style={styles.referralHint}>
            {t('earn')}{' '}
            <ThemedText style={styles.referralHintBold}>500 {t('points')}</ThemedText>{' '}
            {t('referralHintSuffix')}
          </ThemedText>

          <Pressable
            onPress={handleInvite}
            style={({ pressed }) => [styles.inviteBtn, pressed && styles.pressed]}>
            <SymbolView
              name={{ ios: 'square.and.arrow.up', android: 'share', web: 'share' }}
              tintColor={BRAND.primary}
              size={16}
            />
            <ThemedText style={styles.inviteBtnText}>{t('inviteFriends')}</ThemedText>
          </Pressable>
        </View>

        {/* Transaction History */}
        <ThemedText style={styles.sectionTitle}>{t('transactionHistory')}</ThemedText>
        <View style={styles.card}>
          {TRANSACTIONS.map((tx, i) => (
            <View
              key={tx.title}
              style={[styles.txRow, i < TRANSACTIONS.length - 1 && styles.txDivider]}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.txTitle}>{tx.title}</ThemedText>
                <ThemedText style={styles.txDate}>{tx.date}</ThemedText>
              </View>
              <ThemedText style={styles.txPoints}>+{tx.points}</ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },

  header: {},
  headerInner: { paddingHorizontal: Spacing.four, paddingTop: Spacing.two, paddingBottom: Spacing.three },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.three, paddingBottom: Spacing.five, gap: Spacing.three },

  // Points Card
  pointsCard: {
    backgroundColor: BRAND.planBg,
    borderRadius: 16,
    padding: Spacing.four,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: BRAND.planBorder,
  },
  pointsNumber: { fontSize: 52, fontWeight: '800', color: '#FFFFFF', lineHeight: 60 },
  pointsLabel: { fontSize: 14, color: 'rgba(255,255,255,0.65)' },
  redeemBtn: {
    marginTop: 8,
    backgroundColor: BRAND.primary,
    borderRadius: 999,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  redeemBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },

  // Referral Card
  referralCard: {
    backgroundColor: BRAND.card,
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: BRAND.border,
    gap: 14,
  },
  referralCardTitle: { fontSize: 15, fontWeight: '700', color: BRAND.text },

  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: BRAND.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFAF5',
  },
  codeText: { fontSize: 18, fontWeight: '800', color: BRAND.primary, letterSpacing: 1 },
  copyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: BRAND.primary,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  copyBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },

  referralHint: { fontSize: 13, color: BRAND.textSecondary },
  referralHintBold: { fontWeight: '700', color: BRAND.primary },

  inviteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FFF1DE',
    borderRadius: 12,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#F5DFC0',
  },
  inviteBtnText: { fontSize: 14, fontWeight: '700', color: BRAND.primary },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: BRAND.text },

  card: {
    backgroundColor: BRAND.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BRAND.border,
    overflow: 'hidden',
  },
  txRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 14, gap: 10,
  },
  txDivider: { borderBottomWidth: 1, borderBottomColor: BRAND.border },
  txTitle: { fontSize: 14, fontWeight: '600', color: BRAND.text },
  txDate: { fontSize: 12, color: BRAND.textSecondary, marginTop: 2 },
  txPoints: { fontSize: 16, fontWeight: '800', color: BRAND.green },

  pressed: { opacity: 0.85 },
});
