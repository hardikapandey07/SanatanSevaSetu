import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ApiService, type Service } from '@/constants/api';
import { getApiBaseUrl } from '@/constants/environment';
import { Spacing } from '@/constants/theme';
import { useT, useTranslatedBatch } from '@/i18n/LanguageContext';

const BRAND = {
  primary: '#E8731C',
  primaryDark: '#C95A0E',
  bg: '#F7F4EE',
  card: '#FFFFFF',
  border: '#EFE7D7',
  text: '#1F1A14',
  textSecondary: '#6B6258',
  planBg: '#2D1F0E',
  planBorder: '#4A3520',
};

const CATEGORY_EMOJIS: Record<string, string> = {
  'Pooja Packages': '🪔',
  'Live Streaming': '📺',
};

const CATEGORY_COLORS: Record<string, string> = {
  'Pooja Packages': '#FDE2D0',
  'Live Streaming': '#DBEAFE',
};

function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

export default function ServicesScreen() {
  const t = useT();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    ApiService.getServices().then(data => {
      setServices(data.filter(s => s.is_active));
      setLoading(false);
    });
  }, []);

  const grouped = services.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient
        colors={[BRAND.primary, BRAND.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerInner}>
          <ThemedText style={styles.headerTitle}>{t('servicesTitle')}</ThemedText>
          <ThemedText style={styles.headerSubtitle}>{t('servicesSubtitle')}</ThemedText>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Active Plan Card */}
        <View style={styles.planCard}>
          <View style={styles.planTopRow}>
            <View style={styles.planBadgeRow}>
              <ThemedText style={styles.planCrownEmoji}>👑</ThemedText>
              <ThemedText style={styles.planBadgeText}>ACTIVE PLAN</ThemedText>
            </View>
            <View style={styles.planCountBox}>
              <ThemedText style={styles.planCount}>12</ThemedText>
              <ThemedText style={styles.planCountLabel}>Poojas left</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.planName}>Monthly Devotee Plan</ThemedText>
          <ThemedText style={styles.planValidity}>Valid till Oct 31, 2025</ThemedText>
          <View style={styles.planActions}>
            <Pressable style={({ pressed }) => [styles.upgradBtn, pressed && styles.pressed]}>
              <ThemedText style={styles.upgradeBtnText}>Upgrade Plan</ThemedText>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.detailsBtn, pressed && styles.pressed]}>
              <ThemedText style={styles.detailsBtnText}>View Details</ThemedText>
            </Pressable>
          </View>
        </View>

        {/* All Services */}
        <ThemedText style={styles.sectionTitle}>{t('allServices')}</ThemedText>
        {loading ? (
          <ActivityIndicator size="large" color={BRAND.primary} style={{ marginTop: 24 }} />
        ) : (
          <View style={styles.grid}>
            {Object.entries(grouped).map(([category, items]) => (
              <View key={category} style={{ gap: 8 }}>
                <ThemedText style={styles.categoryLabel}>{category}</ThemedText>
                {chunk(items, 2).map((row, rowIdx) => (
                  <View key={rowIdx} style={styles.gridRow}>
                    {row.map(item => (
                      <ServiceCard key={item.id} item={item} />
                    ))}
                    {row.length === 1 && <View style={styles.gridPlaceholder} />}
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function ServiceCard({ item }: { item: Service }) {
  const [serviceName, serviceCategory] = useTranslatedBatch([item.name, item.category]);
  const emoji = CATEGORY_EMOJIS[item.category] ?? '🙏';
  const bgColor = CATEGORY_COLORS[item.category] ?? '#FFF1DE';
  const imageUri = item.image_url ? `${getApiBaseUrl()}/${item.image_url}` : null;

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/service-detail', params: { serviceId: item.id, serviceName: item.name, servicePrice: String(item.price), serviceCategory: item.category, serviceImage: item.image_url ?? '' } })}
      style={({ pressed }) => [styles.serviceCard, pressed && styles.pressed]}>
      <View style={[styles.serviceImg, { backgroundColor: bgColor }]}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        ) : (
          <ThemedText style={styles.serviceEmoji}>{emoji}</ThemedText>
        )}
        <View style={styles.pricePill}>
          <ThemedText style={styles.priceText}>₹{item.price.toLocaleString()}</ThemedText>
        </View>
      </View>
      <View style={styles.serviceBody}>
        <ThemedText style={styles.serviceTitle}>{serviceName}</ThemedText>
        <ThemedText style={styles.serviceCategory}>{serviceCategory}</ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },

  header: { paddingBottom: Spacing.three },
  headerInner: { paddingHorizontal: Spacing.four, paddingTop: Spacing.two, gap: 4 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },

  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },

  // Plan card
  planCard: {
    backgroundColor: BRAND.planBg,
    borderRadius: 16,
    padding: Spacing.three,
    gap: 6,
    borderWidth: 1,
    borderColor: BRAND.planBorder,
  },
  planTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  planBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  planCrownEmoji: { fontSize: 14 },
  planBadgeText: { fontSize: 11, fontWeight: '800', color: BRAND.primary, letterSpacing: 0.5 },
  planCountBox: { alignItems: 'flex-end' },
  planCount: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', lineHeight: 30 },
  planCountLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  planName: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  planValidity: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 6 },
  planActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  upgradBtn: {
    flex: 1,
    backgroundColor: BRAND.primary,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  upgradeBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  detailsBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  detailsBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  sectionTitle: { fontSize: 17, fontWeight: '800', color: BRAND.text },

  // 2-column grid
  grid: {
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridPlaceholder: { flex: 1 },
  serviceCard: {
    flex: 1,
    backgroundColor: BRAND.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BRAND.border,
    overflow: 'hidden',
  },
  serviceImg: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  serviceEmoji: { fontSize: 44 },
  pricePill: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  priceText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  categoryLabel: { fontSize: 13, fontWeight: '700', color: BRAND.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  serviceBody: { padding: 10, gap: 4 },
  serviceTitle: { fontSize: 14, fontWeight: '800', color: BRAND.text },
  serviceCategory: { fontSize: 11, color: BRAND.textSecondary },

  pressed: { opacity: 0.85 },
});
