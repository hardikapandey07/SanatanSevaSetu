import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ApiService, type Banner } from '@/constants/api';
import { getApiBaseUrl } from '@/constants/environment';
import { Spacing } from '@/constants/theme';

const BRAND = {
  primary: '#E8731C',
  primaryDark: '#C95A0E',
  bg: '#F7F4EE',
  card: '#FFFFFF',
  border: '#EFE7D7',
  text: '#1F1A14',
  textSecondary: '#6B6258',
};

export default function BannerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiService.getActiveBanners().then(data => {
      setBanner(data.find(b => b.id === id) ?? null);
      setLoading(false);
    });
  }, [id]);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
      });
    } catch { return ''; }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[BRAND.primary, BRAND.primaryDark]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerInner}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
            <SymbolView
              name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
              tintColor="#FFFFFF" size={18}
            />
          </Pressable>
          <ThemedText style={styles.headerTitle} numberOfLines={1}>
            {banner?.title ?? 'Banner Details'}
          </ThemedText>
        </SafeAreaView>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={BRAND.primary} />
        </View>
      ) : !banner ? (
        <View style={styles.center}>
          <ThemedText style={styles.errorText}>Banner not found.</ThemedText>
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Banner Image */}
          <View style={styles.imageWrap}>
            <Image
              source={{ uri: `${getApiBaseUrl()}/${banner.mobile_image}` }}
              style={styles.bannerImage}
              contentFit="cover"
            />
          </View>

          {/* Details Card */}
          <View style={styles.card}>
            <ThemedText style={styles.title}>{banner.title}</ThemedText>
            <ThemedText style={styles.description}>{banner.description}</ThemedText>

            <View style={styles.metaRow}>
              <SymbolView
                name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }}
                tintColor={BRAND.primary} size={14}
              />
              <ThemedText style={styles.metaText}>
                {formatDate(banner.start_date)} – {formatDate(banner.expiry_date)}
              </ThemedText>
            </View>

            {banner.duration_days > 0 && (
              <View style={styles.metaRow}>
                <SymbolView
                  name={{ ios: 'clock', android: 'schedule', web: 'schedule' }}
                  tintColor={BRAND.primary} size={14}
                />
                <ThemedText style={styles.metaText}>{banner.duration_days} days</ThemedText>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          {banner.buttons.length > 0 && (
            <View style={styles.btnsWrap}>
              {banner.buttons
                .sort((a, b) => a.button_order - b.button_order)
                .map((btn, i) => (
                  <Pressable
                    key={btn.id}
                    onPress={() => Linking.openURL(btn.button_link)}
                    style={({ pressed }) => [
                      i === 0 ? styles.btnPrimary : styles.btnSecondary,
                      pressed && styles.pressed,
                    ]}>
                    <ThemedText style={i === 0 ? styles.btnPrimaryText : styles.btnSecondaryText}>
                      {btn.button_text}
                    </ThemedText>
                  </Pressable>
                ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },
  header: { paddingBottom: Spacing.three },
  headerInner: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.three, paddingTop: Spacing.two, gap: 12,
  },
  backBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 15, color: BRAND.textSecondary },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.five },
  imageWrap: { borderRadius: 16, overflow: 'hidden', height: 220 },
  bannerImage: { width: '100%', height: '100%' },
  card: {
    backgroundColor: BRAND.card, borderRadius: 14,
    borderWidth: 1, borderColor: BRAND.border,
    padding: Spacing.three, gap: 10,
  },
  title: { fontSize: 20, fontWeight: '800', color: BRAND.text },
  description: { fontSize: 14, color: BRAND.textSecondary, lineHeight: 22 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontSize: 13, color: BRAND.textSecondary, fontWeight: '600' },
  btnsWrap: { gap: 10 },
  btnPrimary: {
    backgroundColor: BRAND.primary, borderRadius: 12,
    height: 48, alignItems: 'center', justifyContent: 'center',
  },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  btnSecondary: {
    borderWidth: 1.5, borderColor: BRAND.primary, borderRadius: 12,
    height: 48, alignItems: 'center', justifyContent: 'center',
    backgroundColor: BRAND.card,
  },
  btnSecondaryText: { color: BRAND.primary, fontSize: 15, fontWeight: '700' },
  pressed: { opacity: 0.85 },
});
