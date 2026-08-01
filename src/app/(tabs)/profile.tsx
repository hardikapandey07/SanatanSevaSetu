import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { ApiService, TokenManager, type UserBooking } from '@/constants/api';
import { unregisterForPush } from '@/constants/push';
import { useT } from '@/i18n/LanguageContext';
import type { TranslationKey } from '@/i18n/translations';

const BRAND = {
  primary: '#E8731C',
  primaryDark: '#C95A0E',
  bg: '#F7F4EE',
  card: '#FFFFFF',
  border: '#EFE7D7',
  inputBorder: '#E5DCC8',
  text: '#1F1A14',
  textSecondary: '#6B6258',
  pendingBg: '#FFF1DE',
  pendingText: '#C95A0E',
  completedBg: '#D5F1DE',
  completedText: '#15803D',
  failedBg: '#FEE2E2',
  failedText: '#DC2626',
  logoutColor: '#DC2626',
  disabledBg: '#CFC4B0',
};

function bookingStatusStyle(status: string) {
  const s = status.toUpperCase();
  if (s === 'COMPLETED' || s === 'SUCCESS') return { bg: BRAND.completedBg, text: BRAND.completedText };
  if (s === 'FAILED' || s === 'CANCELLED') return { bg: BRAND.failedBg, text: BRAND.failedText };
  return { bg: BRAND.pendingBg, text: BRAND.pendingText };
}

function formatBookingDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

type MenuRow = { labelKey: TranslationKey; icon: { ios: string; android: string; web: string }; route?: string };
const MENU: MenuRow[] = [
  { labelKey: 'languageSettings', icon: { ios: 'character.bubble', android: 'translate',     web: 'translate'     } },
  { labelKey: 'suggestions',      icon: { ios: 'bubble.left.fill', android: 'chat',          web: 'chat'          }, route: '/suggestion'       },
  { labelKey: 'notifications',    icon: { ios: 'bell.fill',        android: 'notifications', web: 'notifications' }, route: '/notifications'    },
];

export default function ProfileScreen() {
  const t = useT();

  // Profile + bookings data
  const [userName, setUserName]   = useState('');
  const [userMobile, setUserMobile] = useState('');
  const [address, setAddress]     = useState('');
  const [email, setEmail]         = useState('');
  const [loading, setLoading]     = useState(true);
  const [bookings, setBookings]   = useState<UserBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  // Edit modal
  const [editVisible, setEditVisible] = useState(false);
  const [editAddress, setEditAddress] = useState('');
  const [editEmail, setEditEmail]     = useState('');
  const [saving, setSaving]           = useState(false);
  const [saveError, setSaveError]     = useState('');

  useEffect(() => {
    loadProfile();
    ApiService.getMyBookings().then(data => {
      setBookings(data);
      setBookingsLoading(false);
    });
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    // Always fetch fresh from API
    const res = await ApiService.getProfile();
    if (res.success && res.data) {
      setUserName(res.data.name ?? '');
      setUserMobile(res.data.mobile_number ?? '');
      setAddress(res.data.address ?? '');
      setEmail(res.data.email_id ?? '');
    } else {
      // Fallback to stored token data for name/mobile
      const profile = await TokenManager.getUserProfile();
      if (profile.name)   setUserName(profile.name);
      if (profile.mobile) setUserMobile(profile.mobile);
    }
    setLoading(false);
  };

  const openEdit = () => {
    setEditAddress(address);
    setEditEmail(email);
    setSaveError('');
    setEditVisible(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    const result = await ApiService.updateProfile({ address: editAddress.trim(), email_id: editEmail.trim() });
    setSaving(false);
    if (!result.success) {
      setSaveError(result.message);
      return;
    }
    setAddress(editAddress.trim());
    setEmail(editEmail.trim());
    setEditVisible(false);
  };

  const displayName   = userName   || 'NA';
  const displayMobile = userMobile ? `+91 ${userMobile.slice(0, 5)} ${userMobile.slice(5)}` : 'NA';
  const avatarLetter  = userName   ? userName.charAt(0).toUpperCase() : '?';
  const profileComplete = !!address;

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
      <LinearGradient
        colors={[BRAND.primary, BRAND.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerInner}>
          {/* Edit pen icon */}
          <Pressable onPress={openEdit} style={({ pressed }) => [styles.editBtn, pressed && styles.pressed]}>
            <SymbolView
              name={{ ios: 'pencil', android: 'edit', web: 'edit' }}
              tintColor="#FFFFFF"
              size={16}
            />
          </Pressable>

          {/* Avatar + info */}
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>{avatarLetter}</ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.profileName}>{displayName}</ThemedText>
              <ThemedText style={styles.profileMeta}>{displayMobile}</ThemedText>
              {!!address && (
                <ThemedText style={styles.profileAddress} numberOfLines={1}>📍 {address}</ThemedText>
              )}
              {!!email && (
                <ThemedText style={styles.profileMeta}>✉️ {email}</ThemedText>
              )}
            </View>
          </View>

          {/* Profile completion hint */}
          {!profileComplete && (
            <Pressable onPress={openEdit} style={({ pressed }) => [styles.completePill, pressed && styles.pressed]}>
              <SymbolView
                name={{ ios: 'exclamationmark.circle', android: 'info', web: 'info' }}
                tintColor="#FFFFFF"
                size={14}
              />
              <ThemedText style={styles.completePillText}>Complete your profile</ThemedText>
              <SymbolView
                name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                tintColor="rgba(255,255,255,0.8)"
                size={12}
              />
            </Pressable>
          )}
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* My Bookings */}
        <View style={styles.bookingsSectionHeader}>
          <ThemedText style={styles.sectionTitle}>{t('myBookings')}</ThemedText>
        </View>
        <View style={styles.card}>
          {bookingsLoading ? (
            <ActivityIndicator size="small" color={BRAND.primary} style={{ margin: 20 }} />
          ) : bookings.length === 0 ? (
            <View style={styles.emptyBookings}>
              <ThemedText style={styles.emptyBookingsEmoji}>🙏</ThemedText>
              <ThemedText style={styles.emptyBookingsText}>No bookings yet</ThemedText>
            </View>
          ) : (
            bookings.slice(0, 3).map((b, i) => {
              const st = bookingStatusStyle(b.status);
              return (
                <View key={b.id} style={[styles.bookingRow, i < Math.min(bookings.length, 3) - 1 && styles.divider]}>
                  <View style={{ flex: 1, gap: 3 }}>
                    <ThemedText style={styles.bookingTitle} numberOfLines={2}>{b.title}</ThemedText>
                    <View style={styles.bookingMetaRow}>
                      <ThemedText style={styles.bookingMeta}>{b.booking_type}</ThemedText>
                      <View style={styles.datePill}>
                        <ThemedText style={styles.datePillText}>📅 {formatBookingDate(b.booking_date)}</ThemedText>
                      </View>
                    </View>
                    <ThemedText style={styles.bookingAmount}>₹{b.amount.toLocaleString('en-IN')}</ThemedText>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                    <ThemedText style={[styles.statusText, { color: st.text }]}>{b.status}</ThemedText>
                  </View>
                </View>
              );
            })
          )}
        </View>
        {!bookingsLoading && bookings.length > 0 && (
          <Pressable
            onPress={() => router.push('/my-bookings')}
            style={({ pressed }) => [styles.viewAllBtn, pressed && styles.pressed]}>
            <SymbolView
              name={{ ios: 'calendar', android: 'event', web: 'event' }}
              tintColor={BRAND.primary}
              size={16}
            />
            <ThemedText style={styles.viewAllBtnText}>View All Bookings</ThemedText>
            <SymbolView
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              tintColor={BRAND.primary}
              size={14}
            />
          </Pressable>
        )}

        {/* Menu */}
        <View style={styles.card}>
          {MENU.map((row, i) => (
            <Pressable
              key={row.labelKey}
              onPress={() => {
                if (row.labelKey === 'languageSettings') router.push('/language-settings');
                else if (row.route) router.push(row.route as never);
              }}
              style={({ pressed }) => [
                styles.menuRow,
                i < MENU.length - 1 && styles.divider,
                pressed && styles.pressed,
              ]}>
              <View style={styles.menuIconBg}>
                <SymbolView name={row.icon} tintColor={BRAND.primary} size={16} />
              </View>
              <ThemedText style={styles.menuLabel}>{t(row.labelKey)}</ThemedText>
              <SymbolView
                name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                tintColor={BRAND.textSecondary}
                size={14}
              />
            </Pressable>
          ))}
        </View>

        {/* Logout */}
        <Pressable
          onPress={async () => { await unregisterForPush(); await TokenManager.clearToken(); router.replace('/'); }}
          style={({ pressed }) => [styles.logoutBtn, pressed && styles.pressed]}>
          <SymbolView
            name={{ ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' }}
            tintColor={BRAND.logoutColor}
            size={16}
          />
          <ThemedText style={styles.logoutText}>{t('logout')}</ThemedText>
        </Pressable>
      </ScrollView>

      {/* ── Edit Profile Modal ── */}
      <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalBox}>
              <View style={styles.modalHandle} />

              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Edit Profile</ThemedText>
                <Pressable onPress={() => setEditVisible(false)} style={({ pressed }) => [styles.modalCloseBtn, pressed && styles.pressed]}>
                  <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} tintColor={BRAND.textSecondary} size={16} />
                </Pressable>
              </View>

              {/* Non-editable fields */}
              <View style={styles.modalField}>
                <ThemedText style={styles.modalLabel}>{t('name')}</ThemedText>
                <View style={styles.modalInputDisabled}>
                  <ThemedText style={styles.modalInputDisabledText}>{displayName}</ThemedText>
                  <SymbolView name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }} tintColor={BRAND.textSecondary} size={14} />
                </View>
              </View>

              <View style={styles.modalField}>
                <ThemedText style={styles.modalLabel}>{t('mobileNumber')}</ThemedText>
                <View style={styles.modalInputDisabled}>
                  <ThemedText style={styles.modalInputDisabledText}>{displayMobile}</ThemedText>
                  <SymbolView name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }} tintColor={BRAND.textSecondary} size={14} />
                </View>
              </View>

              {/* Editable fields */}
              <View style={styles.modalField}>
                <ThemedText style={styles.modalLabel}>Address *</ThemedText>
                <TextInput
                  value={editAddress}
                  onChangeText={setEditAddress}
                  placeholder="Enter your full address"
                  placeholderTextColor={BRAND.textSecondary}
                  multiline
                  numberOfLines={3}
                  style={[styles.modalInput, styles.modalInputMultiline,
                    Platform.OS === 'web' ? ({ outlineWidth: 0 } as object) : null,
                  ]}
                />
              </View>

              <View style={styles.modalField}>
                <ThemedText style={styles.modalLabel}>Email ID (Optional)</ThemedText>
                <TextInput
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={BRAND.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[styles.modalInput,
                    Platform.OS === 'web' ? ({ outlineWidth: 0 } as object) : null,
                  ]}
                />
              </View>

              {!!saveError && (
                <ThemedText style={styles.saveError}>{saveError}</ThemedText>
              )}

              <View style={styles.modalBtns}>
                <Pressable
                  onPress={() => setEditVisible(false)}
                  style={({ pressed }) => [styles.modalBtnCancel, pressed && styles.pressed]}>
                  <ThemedText style={styles.modalBtnCancelText}>{t('langCancel')}</ThemedText>
                </Pressable>
                <Pressable
                  onPress={handleSave}
                  disabled={saving}
                  style={({ pressed }) => [styles.modalBtnSave, saving && styles.modalBtnDisabled, pressed && !saving && styles.pressed]}>
                  <ThemedText style={styles.modalBtnSaveText}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },

  header: { paddingBottom: Spacing.four },
  headerInner: { paddingHorizontal: Spacing.four, paddingTop: Spacing.two, gap: 14 },

  editBtn: {
    alignSelf: 'flex-end',
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)',
  },

  profileRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  avatar: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: '#FFFFFF',
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  profileName: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  profileMeta: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 3 },
  profileAddress: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 3 },

  completePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9,
    alignSelf: 'flex-start',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
  },
  completePillText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.three, paddingBottom: Spacing.five, gap: Spacing.three },

  bookingsSectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: BRAND.text },

  card: { backgroundColor: BRAND.card, borderWidth: 1, borderColor: BRAND.border, borderRadius: 14, overflow: 'hidden' },
  divider: { borderBottomWidth: 1, borderBottomColor: BRAND.border },

  emptyBookings: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyBookingsEmoji: { fontSize: 32 },
  emptyBookingsText: { fontSize: 13, color: BRAND.textSecondary, fontWeight: '600' },

  bookingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14, gap: 10 },
  bookingTitle: { fontSize: 13, fontWeight: '700', color: BRAND.text, lineHeight: 18 },
  bookingMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  bookingMeta: { fontSize: 11, color: BRAND.textSecondary },
  datePill: {
    backgroundColor: BRAND.pendingBg,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#F5D9B8',
  },
  datePillText: { fontSize: 11, fontWeight: '800', color: BRAND.primary },
  bookingAmount: { fontSize: 13, fontWeight: '800', color: BRAND.primary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, flexShrink: 0 },
  statusText: { fontSize: 11, fontWeight: '700' },

  viewAllBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: BRAND.card,
    borderWidth: 1.5, borderColor: BRAND.primary,
    borderRadius: 12, paddingVertical: 13,
  },
  viewAllBtnText: { fontSize: 14, fontWeight: '700', color: BRAND.primary },

  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
  menuIconBg: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFF1DE', alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: BRAND.text },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: BRAND.logoutColor,
    borderRadius: 12, paddingVertical: 13,
    backgroundColor: BRAND.card,
  },
  logoutText: { color: BRAND.logoutColor, fontSize: 14, fontWeight: '700' },

  // Edit Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.four, gap: 14,
    maxHeight: '90%',
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0D6C2', alignSelf: 'center', marginBottom: 4 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: BRAND.text },
  modalCloseBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#F3EAD7',
    alignItems: 'center', justifyContent: 'center',
  },

  modalField: { gap: 6 },
  modalLabel: { fontSize: 13, fontWeight: '700', color: BRAND.text },

  modalInputDisabled: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderColor: '#EDE3D2',
    borderRadius: 10, paddingHorizontal: 12, height: 46,
    backgroundColor: '#F9F5EF',
  },
  modalInputDisabledText: { fontSize: 14, color: BRAND.textSecondary },

  modalInput: {
    borderWidth: 1.5, borderColor: BRAND.inputBorder,
    borderRadius: 10, paddingHorizontal: 12,
    height: 46, fontSize: 14, color: BRAND.text,
    backgroundColor: '#FFFFFF',
  },
  modalInputMultiline: { height: 80, paddingTop: 10, textAlignVertical: 'top' },

  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 4 },
  modalBtnCancel: {
    flex: 1, paddingVertical: 13, borderRadius: 12,
    borderWidth: 1.5, borderColor: BRAND.border, alignItems: 'center',
  },
  modalBtnCancelText: { fontSize: 14, fontWeight: '700', color: BRAND.textSecondary },
  modalBtnSave: {
    flex: 1, paddingVertical: 13, borderRadius: 12,
    backgroundColor: BRAND.primary, alignItems: 'center',
  },
  modalBtnDisabled: { backgroundColor: BRAND.disabledBg },
  modalBtnSaveText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },

  pressed: { opacity: 0.85 },
  saveError: { fontSize: 13, color: '#DC2626', fontWeight: '600', textAlign: 'center' },
});
