import { Image } from 'expo-image';
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ApiService, type Mandir } from "@/constants/api";
import { getApiBaseUrl } from "@/constants/environment";
import { Spacing } from "@/constants/theme";
import { useT, useTranslatedBatch } from "@/i18n/LanguageContext";

const BRAND = {
  primary: "#E8731C",
  primaryDark: "#C95A0E",
  bg: "#F7F4EE",
  card: "#FFFFFF",
  border: "#EFE7D7",
  text: "#1F1A14",
  textSecondary: "#6B6258",
  avatarBg: "#FFE7CF",
  verifiedBg: "#D1FAE5",
  verifiedText: "#15803D",
};

export default function TempleSearchScreen() {
  const t = useT();
  const [mandirs, setMandirs] = useState<Mandir[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? mandirs.filter((m) =>
        m.mandir_name.toLowerCase().includes(search.toLowerCase()) ||
        m.address.toLowerCase().includes(search.toLowerCase()),
      )
    : mandirs;

  const loadMandirs = () => {
    setLoading(true);
    setError("");
    ApiService.getMandirs()
      .then((data) => {
        setMandirs(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load temples. Please try again.");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadMandirs();
  }, []);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[BRAND.primary, BRAND.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={["top"]} style={styles.headerInner}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          >
            <SymbolView
              name={{
                ios: "chevron.left",
                android: "arrow_back",
                web: "arrow_back",
              }}
              tintColor="#FFFFFF"
              size={18}
            />
          </Pressable>
          <ThemedText style={styles.headerTitle}>
            {t("templeSearchTitle")}
          </ThemedText>
        </SafeAreaView>
        <View style={styles.searchContainer}>
          <View style={styles.searchWrap}>
            <SymbolView
              name={{
                ios: "magnifyingglass",
                android: "search",
                web: "search",
              }}
              tintColor={BRAND.textSecondary}
              size={15}
            />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={t('searchByTemple')}
              placeholderTextColor={BRAND.textSecondary}
              style={styles.searchInput}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")}>
                <SymbolView
                  name={{
                    ios: "xmark.circle.fill",
                    android: "cancel",
                    web: "cancel",
                  }}
                  tintColor={BRAND.textSecondary}
                  size={15}
                />
              </Pressable>
            )}
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={BRAND.primary} />
            <ThemedText style={styles.loadingText}>{t('loadingTemples')}</ThemedText>
          </View>
        ) : error ? (
          <View style={styles.centerBox}>
            <ThemedText style={styles.errorEmoji}>🛕</ThemedText>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <Pressable
              onPress={() => {
                setLoading(true);
                setError("");
                loadMandirs();
              }}
              style={({ pressed }) => [
                styles.retryBtn,
                pressed && styles.pressed,
              ]}
            >
            <ThemedText style={styles.retryText}>{t('retry')}</ThemedText>
            </Pressable>
          </View>
        ) : mandirs.length === 0 ? (
          <View style={styles.centerBox}>
            <ThemedText style={styles.errorEmoji}>🛕</ThemedText>
            <ThemedText style={styles.errorText}>{t('noTemplesFoundSearch')}</ThemedText>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.centerBox}>
            <ThemedText style={styles.errorEmoji}>🔍</ThemedText>
            <ThemedText style={styles.errorText}>
              No temples match "{search}"
            </ThemedText>
          </View>
        ) : (
          filtered.map((mandir) => (
            <TempleCard key={mandir.id} mandir={mandir} t={t} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function TempleCard({ mandir, t }: { mandir: Mandir; t: (k: any) => string }) {
  const [mandirName, mandirAddress, chadhava, pujaCentre] = useTranslatedBatch([
    mandir.mandir_name,
    mandir.address,
    mandir.chadhava_details,
    mandir.puja_centre_name,
  ]);

  const formatTime = (t: string) => {
    if (!t || t === '00:00:00') return null;
    const [h, m] = t.split(':');
    const hour = parseInt(h, 10);
    return `${hour % 12 || 12}:${m} ${hour < 12 ? 'AM' : 'PM'}`;
  };

  const openTime = formatTime(mandir.opening_time);
  const closeTime = formatTime(mandir.closing_time);
  const timings = openTime && closeTime ? `${openTime} – ${closeTime}` : openTime || closeTime || '—';

  const imageUri = mandir.mandir_image_url ? `${getApiBaseUrl()}/${mandir.mandir_image_url}` : null;

  return (
    <View style={styles.card}>
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={styles.templeImage}
          contentFit="cover"
        />
      )}
      <View style={styles.templeRow}>
        <View style={styles.avatar}>
          <ThemedText style={styles.avatarEmoji}>🛕</ThemedText>
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <View style={styles.nameRow}>
            <ThemedText style={styles.templeName} numberOfLines={1}>
              {mandirName}
            </ThemedText>
            {mandir.is_verify && (
              <View style={styles.verifiedBadge}>
                <ThemedText style={styles.verifiedText}>{t('verified')}</ThemedText>
              </View>
            )}
          </View>

          {chadhava ? (
            <View style={styles.metaRow}>
              <SymbolView
                name={{ ios: "star.fill", android: "star", web: "star" }}
                tintColor={BRAND.textSecondary}
                size={11}
              />
              <ThemedText style={styles.templeMeta} numberOfLines={1}>
                {t('chadhava')}: {chadhava}
              </ThemedText>
            </View>
          ) : null}

          <View style={styles.metaRow}>
            <SymbolView
              name={{ ios: "mappin.and.ellipse", android: "place", web: "place" }}
              tintColor={BRAND.textSecondary}
              size={11}
            />
            <ThemedText style={styles.templeMeta} numberOfLines={1}>
              {mandirAddress}
            </ThemedText>
          </View>

          <View style={styles.metaRow}>
            <SymbolView
              name={{ ios: "clock", android: "schedule", web: "schedule" }}
              tintColor={BRAND.textSecondary}
              size={11}
            />
            <ThemedText style={styles.templeMeta}>{timings}</ThemedText>
          </View>

          {mandir.contact_no ? (
            <View style={styles.metaRow}>
              <SymbolView
                name={{ ios: "phone.fill", android: "call", web: "call" }}
                tintColor={BRAND.textSecondary}
                size={11}
              />
              <ThemedText style={styles.templeMeta}>
                +91 {mandir.contact_no}
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>

      {pujaCentre && pujaCentre !== 'Not Applicable' ? (
        <View style={styles.pujaCentreRow}>
          <ThemedText style={styles.pujaCentreLabel}>{t('pujaCentre')}: </ThemedText>
          <ThemedText style={styles.pujaCentreValue}>
            {pujaCentre}
          </ThemedText>
        </View>
      ) : null}

      <View style={styles.actionRow}>
        {/* <Pressable
          style={({ pressed }) => [
            styles.outlineBtn,
            pressed && styles.pressed,
          ]}
        >
          <SymbolView
            name={{ ios: "map.fill", android: "map", web: "map" }}
            tintColor={BRAND.primary}
            size={13}
          />
          <ThemedText style={styles.outlineText}>
            {t("getDirections")}
          </ThemedText>
        </Pressable> */}
        <Pressable
          style={({ pressed }) => [styles.filledBtn, pressed && styles.pressed]}
          onPress={() => router.push({
            pathname: '/temple-detail',
            params: {
              id: mandir.id,
              name: mandir.mandir_name,
              address: mandir.address,
              pincode: mandir.pincode ?? '',
              contact_person: mandir.contact_person ?? '',
              contact_no: mandir.contact_no ?? '',
              email_id: mandir.email_id ?? '',
              opening_time: mandir.opening_time ?? '',
              closing_time: mandir.closing_time ?? '',
              is_verify: String(mandir.is_verify),
              puja_centre_name: mandir.puja_centre_name ?? '',
              chadhava_details: mandir.chadhava_details ?? '',
              image_url: mandir.mandir_image_url ?? '',
              latitude: String(mandir.latitude ?? ''),
              longitude: String(mandir.longitude ?? ''),
              how_to_reach: mandir.how_to_reach ?? '',
              best_time_to_visit: mandir.best_time_to_visit ?? '',
            },
          })}
        >
          <ThemedText style={styles.filledText}>
            {t("viewDetailsBtn")}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },
  header: { paddingBottom: 0 },
  headerInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    gap: 12,
    paddingBottom: Spacing.two,
  },
  searchContainer: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: BRAND.text,
    ...(Platform.OS === "web"
      ? ({ outlineWidth: 0, outlineStyle: "none" } as object)
      : null),
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#FFFFFF" },
  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },

  centerBox: { alignItems: "center", paddingVertical: 60, gap: 10 },
  loadingText: { fontSize: 14, color: BRAND.textSecondary, marginTop: 8 },
  errorEmoji: { fontSize: 40 },
  errorText: { fontSize: 15, fontWeight: "600", color: BRAND.text },
  retryBtn: {
    marginTop: 4,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: BRAND.primary,
  },
  retryText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },

  card: {
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 14,
    overflow: 'hidden',
    gap: 12,
  },
  templeImage: {
    width: '100%',
    height: 100,
  },
  templeRow: { flexDirection: "row", gap: 12, alignItems: "flex-start", paddingHorizontal: Spacing.three, paddingTop: Spacing.two },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: BRAND.avatarBg,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: { fontSize: 24 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  templeName: {
    fontSize: 15,
    fontWeight: "800",
    color: BRAND.text,
    flexShrink: 1,
  },
  verifiedBadge: {
    backgroundColor: BRAND.verifiedBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedText: { fontSize: 10, fontWeight: "700", color: BRAND.verifiedText },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  templeMeta: { fontSize: 12, color: BRAND.textSecondary, flexShrink: 1 },
  pujaCentreRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8F0",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginHorizontal: Spacing.three,
  },
  pujaCentreLabel: { fontSize: 12, fontWeight: "700", color: BRAND.primary },
  pujaCentreValue: { fontSize: 12, color: BRAND.text, flexShrink: 1 },
  actionRow: { flexDirection: "row", gap: 10, paddingHorizontal: Spacing.three, paddingBottom: Spacing.two },
  outlineBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    height: 40,
    borderWidth: 1.5,
    borderColor: BRAND.primary,
    backgroundColor: "#FFFFFF",
  },
  outlineText: { color: BRAND.primary, fontSize: 13, fontWeight: "700" },
  filledBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    height: 40,
    backgroundColor: BRAND.primary,
  },
  filledText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  pressed: { opacity: 0.85 },
});
