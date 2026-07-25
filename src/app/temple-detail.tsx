import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Linking, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { getApiBaseUrl } from '@/constants/environment';
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
  verifiedBg: '#D1FAE5',
  verifiedText: '#15803D',
};

export default function TempleDetailScreen() {
  const t = useT();
  const p = useLocalSearchParams<{
    id: string; name: string; address: string; pincode: string;
    contact_person: string; contact_no: string; email_id: string;
    opening_time: string; closing_time: string;
    is_verify: string; puja_centre_name: string;
    chadhava_details: string; image_url: string;
    latitude: string; longitude: string;
    how_to_reach: string; best_time_to_visit: string;
  }>();

  const imageUri = p.image_url ? `${getApiBaseUrl()}/${p.image_url}` : null;
  const isVerified = p.is_verify === 'true';

  const formatTime = (raw: string) => {
    if (!raw || raw === '00:00:00') return null;
    const [h, m] = raw.split(':');
    const hour = parseInt(h, 10);
    return `${hour % 12 || 12}:${m} ${hour < 12 ? 'AM' : 'PM'}`;
  };

  const openTime  = formatTime(p.opening_time);
  const closeTime = formatTime(p.closing_time);
  const timings   = openTime && closeTime
    ? `${openTime} – ${closeTime}`
    : openTime || closeTime || '—';

  const openMaps = () => {
    const lat = parseFloat(p.latitude);
    const lng = parseFloat(p.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      Linking.openURL(`https://maps.google.com/?q=${lat},${lng}`);
    } else {
      Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(p.address)}`);
    }
  };

  const handleShare = () => {
    Share.share({ message: `${p.name}\n${p.address}\n${p.contact_no ? `📞 +91 ${p.contact_no}` : ''}` });
  };

  return (
    <View style={styles.root}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Hero image */}
        <View style={styles.hero}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <LinearGradient colors={[BRAND.primary, BRAND.primaryDark]} style={StyleSheet.absoluteFill} />
          )}
          <View style={styles.heroScrim} />

          <SafeAreaView edges={['top']} style={styles.heroTopBar}>
            <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
              <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} tintColor="#FFFFFF" size={18} />
            </Pressable>
            <View style={{ flex: 1 }} />
            <Pressable onPress={handleShare} style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
              <SymbolView name={{ ios: 'square.and.arrow.up', android: 'share', web: 'share' }} tintColor="#FFFFFF" size={18} />
            </Pressable>
          </SafeAreaView>

          <View style={styles.heroBottom}>
            <View style={styles.heroTitleRow}>
              <ThemedText style={styles.heroTitle} numberOfLines={2}>{p.name}</ThemedText>
              {isVerified && (
                <View style={styles.verifiedBadge}>
                  <ThemedText style={styles.verifiedText}>✓ Verified</ThemedText>
                </View>
              )}
            </View>
            <View style={styles.heroAddressRow}>
              <SymbolView name={{ ios: 'mappin', android: 'place', web: 'place' }} tintColor="rgba(255,255,255,0.8)" size={12} />
              <ThemedText style={styles.heroAddress} numberOfLines={2}>{p.address}</ThemedText>
            </View>
          </View>
        </View>

        {/* Quick info chips */}
        <View style={styles.chipsRow}>
          <View style={styles.chip}>
            <ThemedText style={styles.chipEmoji}>🕐</ThemedText>
            <ThemedText style={styles.chipText}>{timings}</ThemedText>
          </View>
          {!!p.puja_centre_name && p.puja_centre_name !== 'Not Applicable' && (
            <View style={[styles.chip, styles.chipOrange]}>
              <ThemedText style={styles.chipEmoji}>🪔</ThemedText>
              <ThemedText style={[styles.chipText, { color: BRAND.primary }]}>{p.puja_centre_name}</ThemedText>
            </View>
          )}
        </View>

        {/* Details card */}
        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Temple Details</ThemedText>

          <InfoRow icon={{ ios: 'mappin.and.ellipse', android: 'place', web: 'place' }} label="Address" value={p.address} />

          {!!p.pincode && (
            <InfoRow
              icon={{ ios: 'number', android: 'pin_drop', web: 'pin_drop' }}
              label="Pincode"
              value={p.pincode}
            />
          )}

          {!!p.contact_person && (
            <InfoRow
              icon={{ ios: 'person.fill', android: 'person', web: 'person' }}
              label="Contact Person"
              value={p.contact_person}
            />
          )}

          {!!p.contact_no && (
            <InfoRow
              icon={{ ios: 'phone.fill', android: 'call', web: 'call' }}
              label={t('contactNumber')}
              value={`+91 ${p.contact_no}`}
              onPress={() => Linking.openURL(`tel:${p.contact_no}`)}
              pressable
            />
          )}

          {!!p.email_id && (
            <InfoRow
              icon={{ ios: 'envelope.fill', android: 'email', web: 'email' }}
              label={t('emailLabel')}
              value={p.email_id}
              onPress={() => Linking.openURL(`mailto:${p.email_id}`)}
              pressable
            />
          )}

          <InfoRow
            icon={{ ios: 'clock.fill', android: 'schedule', web: 'schedule' }}
            label="Timings"
            value={timings}
          />

          {!!p.chadhava_details && (
            <InfoRow
              icon={{ ios: 'star.fill', android: 'star', web: 'star' }}
              label="Chadhava"
              value={p.chadhava_details}
            />
          )}
        </View>

        {/* How to Reach */}
        {!!p.how_to_reach && (
          <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>🗺️ How to Reach</ThemedText>
            <ThemedText style={styles.cardBody}>{p.how_to_reach}</ThemedText>
          </View>
        )}

        {/* Best Time to Visit */}
        {!!p.best_time_to_visit && (
          <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>🌤️ Best Time to Visit</ThemedText>
            <ThemedText style={styles.cardBody}>{p.best_time_to_visit}</ThemedText>
          </View>
        )}

        {/* Book puja CTA */}
        <Pressable
          onPress={() => router.push('/book-pooja')}
          style={({ pressed }) => [styles.bookBtn, pressed && styles.pressed]}>
          <LinearGradient
            colors={[BRAND.primary, BRAND.primaryDark]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.bookBtnGradient}>
            <ThemedText style={styles.bookBtnText}>🪔 Book a Puja Here</ThemedText>
          </LinearGradient>
        </Pressable>

      </ScrollView>

      {/* Bottom: Get Directions */}
      {/* <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
        <Pressable onPress={openMaps} style={({ pressed }) => [styles.directionsBtn, pressed && styles.pressed]}>
          <SymbolView name={{ ios: 'map.fill', android: 'map', web: 'map' }} tintColor="#FFFFFF" size={16} />
          <ThemedText style={styles.directionsBtnText}>{t('getDirections')}</ThemedText>
        </Pressable>
      </SafeAreaView> */}
    </View>
  );
}

function InfoRow({
  icon, label, value, onPress, pressable,
}: {
  icon: { ios: string; android: string; web: string };
  label: string; value: string;
  onPress?: () => void; pressable?: boolean;
}) {
  const content = (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <SymbolView name={icon} tintColor={BRAND.primary} size={14} />
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText style={styles.infoLabel}>{label}</ThemedText>
        <ThemedText style={[styles.infoValue, pressable && styles.infoValueLink]}>{value}</ThemedText>
      </View>
    </View>
  );
  if (pressable && onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.three },

  hero: { height: 300, justifyContent: 'flex-end', position: 'relative' },
  heroScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  heroTopBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.three, paddingTop: Spacing.two,
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroBottom: {
    padding: Spacing.three, gap: 6,
  },
  heroTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', flexShrink: 1 },
  verifiedBadge: {
    backgroundColor: BRAND.verifiedBg,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  verifiedText: { fontSize: 11, fontWeight: '700', color: BRAND.verifiedText },
  heroAddressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 5 },
  heroAddress: { fontSize: 13, color: 'rgba(255,255,255,0.85)', flex: 1 },

  chipsRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    paddingHorizontal: Spacing.three, paddingVertical: Spacing.two,
  },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EDE3D2', borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  chipOrange: { backgroundColor: '#FFF1DE', borderWidth: 1, borderColor: BRAND.primary },
  chipEmoji: { fontSize: 13 },
  chipText: { fontSize: 13, fontWeight: '600', color: BRAND.text },

  card: {
    marginHorizontal: Spacing.three, marginBottom: Spacing.two,
    backgroundColor: BRAND.card, borderRadius: 14,
    borderWidth: 1, borderColor: BRAND.border,
    padding: Spacing.three, gap: 14,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: BRAND.text },
  cardBody: { fontSize: 14, color: BRAND.textSecondary, lineHeight: 22 },

  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  infoIconWrap: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#FFF1DE',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  infoLabel: { fontSize: 11, color: BRAND.textSecondary, fontWeight: '600', marginBottom: 2 },
  infoValue: { fontSize: 14, color: BRAND.text, fontWeight: '500' },
  infoValueLink: { color: BRAND.primary, textDecorationLine: 'underline' },

  bookBtn: { marginHorizontal: Spacing.three, marginBottom: Spacing.two, borderRadius: 12, overflow: 'hidden' },
  bookBtnGradient: { paddingVertical: 14, alignItems: 'center' },
  bookBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },

  bottomBar: {
    paddingHorizontal: Spacing.three, paddingTop: Spacing.two, paddingBottom: Spacing.two,
    backgroundColor: BRAND.card, borderTopWidth: 1, borderTopColor: BRAND.border,
  },
  directionsBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: BRAND.primary, borderRadius: 12, height: 48,
  },
  directionsBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  pressed: { opacity: 0.85 },
});
