import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ApiService, type PujaDetail, type UserBooking } from '@/constants/api';
import { useT, useTranslatedBatch } from '@/i18n/LanguageContext';

/** Parchment palette, kept local — this document does not follow the app's orange theme. */
const CERT = {
  page: '#FBF3E2',
  sheet: '#FDF8EE',
  gold: '#C9A227',
  goldSoft: '#E4CF9B',
  navy: '#1B3A6B',
  rust: '#A63A1E',
  ink: '#3F3524',
  muted: '#7A6A50',
};

function formatDate(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

/** Small gold diamond used between the ornament rules. */
function Diamond() {
  return <View style={styles.diamond} />;
}

function OrnamentRule({ width = 60 }: { width?: number }) {
  return (
    <View style={styles.ornamentRow}>
      <View style={[styles.ornamentLine, { width }]} />
      <Diamond />
      <View style={[styles.ornamentLine, { width }]} />
    </View>
  );
}

type Props = {
  visible: boolean;
  onClose: () => void;
  booking: UserBooking | null;
};

export function BookingCertificate({ visible, onClose, booking }: Props) {
  const t = useT();
  const [puja, setPuja] = useState<PujaDetail | null>(null);
  const [mandirName, setMandirName] = useState('');
  const [loading, setLoading] = useState(false);

  // reference_id points at a puja only for PUJA BOOKING rows; on BROADCAST EVENT
  // BOOKING it is a broadcast id, so looking it up as a puja would always 404.
  const isPujaBooking = booking?.booking_type?.toUpperCase().includes('PUJA') ?? false;

  // The booking ledger has no temple details, so pull them from the booked puja
  // and then the mandir it belongs to. Both are optional — the certificate still
  // renders from booking data alone if either call fails.
  useEffect(() => {
    if (!visible || !booking) return;
    let cancelled = false;
    setPuja(null);
    setMandirName('');

    if (!isPujaBooking) {
      setLoading(false);
      return () => { cancelled = true; };
    }

    setLoading(true);
    ApiService.getPujaDetail(booking.reference_id)
      .then(async res => {
        if (cancelled) return;
        const detail = res.success ? res.data ?? null : null;
        setPuja(detail);
        if (detail?.mandir_id) {
          const mandir = await ApiService.getMandirById(detail.mandir_id);
          if (!cancelled && mandir) setMandirName(mandir.mandir_name);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [visible, booking?.reference_id, isPujaBooking]);

  const [pujaTitle, templeName, templeAddress] = useTranslatedBatch([
    booking?.title,
    mandirName,
    puja?.mandir_address,
  ]);

  if (!booking) return null;

  const bookingRef = booking.payment_no || booking.id;
  const performedOn = formatDate(puja?.puja_date || booking.booking_date);
  // Event bookings carry no puja/temple, so the booked item becomes the subject
  // instead — otherwise the "…booked through X for" line dangles with nothing after it.
  const subject = templeName || pujaTitle;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.frame}>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} tintColor="#FFFFFF" size={18} />
          </Pressable>

          <ScrollView
            style={styles.page}
            contentContainerStyle={styles.pageContent}
            showsVerticalScrollIndicator={false}>
            {/* Double gold border: outer thin rule, inner sheet */}
            <View style={styles.borderOuter}>
              <View style={styles.sheet}>
                {/* ── Header: logo left, title centre, temple right ── */}
                <View style={styles.headerRow}>
                  <Image
                    source={require('@/assets/images/logo1.jpg')}
                    style={styles.headerImg}
                    contentFit="contain"
                  />
                  <View style={styles.headerCenter}>
                    <OrnamentRule width={40} />
                    <ThemedText style={styles.titleMain}>{t('certPujaBooking')}</ThemedText>
                    <ThemedText style={styles.titleSub}>{t('certCertificate')}</ThemedText>
                    <OrnamentRule width={40} />
                  </View>
                  <Image
                    source={require('@/assets/images/cert-temple.png')}
                    style={styles.headerImg}
                    contentFit="contain"
                  />
                </View>

                {/* ── Booking ref · certify pill · date ── */}
                <View style={styles.certifyPillWrap}>
                  <View style={styles.certifyPill}>
                    <ThemedText style={styles.certifyPillText}>{t('certCertifyThat')}</ThemedText>
                  </View>
                </View>
                <View style={styles.metaBar}>
                  <View style={styles.metaItem}>
                    <ThemedText style={styles.metaLabel}>{t('certBookingId')}: </ThemedText>
                    <ThemedText style={styles.metaValue} numberOfLines={1}>{bookingRef}</ThemedText>
                  </View>
                  <View style={styles.metaItem}>
                    <ThemedText style={styles.metaLabel}>{t('certDate')}: </ThemedText>
                    <ThemedText style={styles.metaValue}>{formatDate(booking.create_date)}</ThemedText>
                  </View>
                </View>

                {/* ── Devotee ── */}
                <View style={styles.devoteeBlock}>
                  <ThemedText style={styles.onBehalf}>{t('certOnBehalfOf')}</ThemedText>
                  <ThemedText style={styles.devoteeName}>
                    {booking.booking_name?.trim() || 'NA'}
                  </ThemedText>
                  <OrnamentRule width={70} />
                </View>

                {/* ── Body ── */}
                {loading ? (
                  <ActivityIndicator color={CERT.gold} style={{ marginVertical: 24 }} />
                ) : (
                  <View style={styles.body}>
                    <ThemedText style={styles.bodyText}>
                      {t('certBookedThrough').replace('{brand}', t('brand'))}
                    </ThemedText>

                    {!!subject && (
                      <ThemedText style={styles.templeName}>{subject}</ThemedText>
                    )}
                    {!!templeAddress && (
                      <ThemedText style={styles.templeAddress}>{templeAddress}</ThemedText>
                    )}

                    <ThemedText style={styles.bodyText}>
                      {t('certPerformedOn')}{' '}
                      <ThemedText style={styles.strongInline}>{performedOn}</ThemedText>
                      {templeName && pujaTitle ? ` (${pujaTitle})` : ''}
                    </ThemedText>

                    <ThemedText style={styles.vidhiNote}>{t('certVidhiNote')}</ThemedText>
                  </View>
                )}

                {/* ── Footer ── */}
                <View style={styles.footer}>
                  <View style={styles.mantraBlock}>
                    <OrnamentRule width={44} />
                    <ThemedText style={styles.mantra}>
                      ॥ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः ॥
                    </ThemedText>
                    <ThemedText style={styles.blessing}>{t('certBlessing')}</ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  frame: { width: '100%', maxWidth: 560, maxHeight: '92%', position: 'relative' },
  closeBtn: {
    position: 'absolute', top: -12, right: -6, zIndex: 20,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center', justifyContent: 'center',
  },
  page: { backgroundColor: CERT.page, borderRadius: 10 },
  pageContent: { padding: 7 },

  borderOuter: {
    borderWidth: 2,
    borderColor: CERT.gold,
    borderRadius: 5,
    padding: 4,
  },
  sheet: {
    backgroundColor: CERT.sheet,
    borderWidth: 1,
    borderColor: CERT.goldSoft,
    borderRadius: 3,
    paddingHorizontal: 18,
    paddingVertical: 20,
    gap: 16,
    overflow: 'hidden',
  },
  // 557x448 source (ratio 1.24) — it fades to transparent on its own, so it sits
  // flush in the corner with no border, frame or extra opacity.
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  // Logo and temple share one box so they read as a matched pair. Both are
  // letterboxed by contentFit="contain", so neither is cropped or stretched.
  headerImg: { width: 84, height: 66 },
  headerCenter: { flex: 1, alignItems: 'center', gap: 4 },
  ornamentRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  ornamentLine: { height: 1, backgroundColor: CERT.gold },
  diamond: {
    width: 5, height: 5,
    backgroundColor: CERT.gold,
    transform: [{ rotate: '45deg' }],
  },
  titleMain: {
    fontSize: 22, fontWeight: '700', color: CERT.navy,
    letterSpacing: 1, textAlign: 'center',
  },
  titleSub: {
    fontSize: 13, fontWeight: '600', color: CERT.gold,
    letterSpacing: 5, textAlign: 'center',
  },

  certifyPillWrap: { alignItems: 'center' },
  certifyPill: {
    backgroundColor: CERT.navy,
    borderWidth: 1, borderColor: CERT.gold,
    paddingHorizontal: 18, paddingVertical: 6,
    borderRadius: 4,
  },
  certifyPillText: { fontSize: 12, fontWeight: '600', color: '#FFF6E0' },

  metaBar: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between', gap: 8,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  metaLabel: { fontSize: 12, color: CERT.navy },
  metaValue: { fontSize: 12, fontWeight: '700', color: CERT.navy, flexShrink: 1 },

  devoteeBlock: { alignItems: 'center', gap: 6 },
  onBehalf: { fontSize: 13, color: CERT.ink },
  devoteeName: {
    fontSize: 30, fontWeight: '700', color: CERT.ink,
    textAlign: 'center', lineHeight: 38,
  },

  body: { alignItems: 'center', gap: 7 },
  bodyText: { fontSize: 13, lineHeight: 21, color: CERT.ink, textAlign: 'center' },
  strongInline: { fontWeight: '700', color: CERT.ink },
  templeName: {
    fontSize: 15, fontWeight: '700', color: CERT.rust,
    textAlign: 'center', marginTop: 2,
  },
  templeAddress: { fontSize: 11, color: CERT.muted, textAlign: 'center' },
  vidhiNote: { fontSize: 12, color: CERT.ink, textAlign: 'center', lineHeight: 19, marginTop: 2 },

  footer: { gap: 14, marginTop: 4 },
  mantraBlock: { alignItems: 'center', gap: 6 },
  mantra: { fontSize: 14, fontWeight: '700', color: CERT.rust, textAlign: 'center' },
  blessing: { fontSize: 11, color: CERT.ink, textAlign: 'center', lineHeight: 17 },
});
