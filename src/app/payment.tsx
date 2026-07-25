import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import QRCode from "qrcode";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import {
  ApiService,
  TokenManager,
  type CreateBookingRequest,
} from "@/constants/api";
import { Spacing } from "@/constants/theme";
import { useT } from "@/i18n/LanguageContext";

const BRAND = {
  primary: "#E8731C",
  primaryDark: "#C95A0E",
  bg: "#F7F4EE",
  card: "#FFFFFF",
  border: "#EFE7D7",
  text: "#1F1A14",
  textSecondary: "#6B6258",
  iconBg: "#FFF1DE",
  disabledBg: "#CFC4B0",
  successBg: "#F0FFF4",
  successText: "#16A34A",
  inputBorder: "#E5DCC8",
};

type IconName = { ios: string; android: string; web: string };
const PAYMENT_METHODS: { key: "upi" | "creditDebitCard"; icon: IconName }[] = [
  { key: "upi", icon: { ios: "iphone", android: "smartphone", web: "smartphone" } },
  { key: "creditDebitCard", icon: { ios: "creditcard.fill", android: "credit_card", web: "credit_card" } },
];

const RATINGS = [1, 2, 3, 4, 5];

// UPI payee details — the QR/deep-link is built on the device from these + the amount.
const UPI_PAYEE_VPA = "abhishri09@okicici";
const UPI_PAYEE_NAME = "Sanatan Seva Setu";

const buildUpiLink = (amount: number, tr: string) =>
  `upi://pay?pa=${UPI_PAYEE_VPA}&pn=${UPI_PAYEE_NAME}&tr=${tr}&am=${amount.toFixed(2)}&cu=INR`;

export default function PaymentScreen() {
  const t = useT();
  const params = useLocalSearchParams<{
    service?: string;
    serviceId?: string;
    servicePrice?: string;
    provider?: string;
    providerId?: string;
    date?: string;
    time?: string;
  }>();

  const [method, setMethod] = useState<"upi" | "creditDebitCard" | "">("");
  const [amount, setAmount] = useState(params.servicePrice || "");
  const [booking, setBooking] = useState(false);

  // UPI flow state
  const [upiStep, setUpiStep] = useState<"idle" | "qr" | "done">("idle");
  const [upiLoading, setUpiLoading] = useState(false);
  const [qrLink, setQrLink] = useState("");
  const [upiAmount, setUpiAmount] = useState(0);
  const [bookingId, setBookingId] = useState("");
  const [upiError, setUpiError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [bookingNumber, setBookingNumber] = useState("");
  const [paymentNo, setPaymentNo] = useState("");

  // Feedback state
  const [paid, setPaid] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const serviceLabel = params.service || "";
  const providerLabel = params.provider || "";
  const dateTime =
    params.date && params.time
      ? `${formatDate(params.date)} at ${params.time}`
      : "";

  const buildBookingDate = () => {
    if (!params.date) return new Date().toISOString();
    const [y, m, d] = params.date.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d)).toISOString();
  };

  // Stale/expired token → clear it and send the user back to log in.
  const handleAuthFailure = async () => {
    await TokenManager.clearToken();
    Alert.alert("Session expired", "Please log in again to continue.", [
      { text: "OK", onPress: () => router.replace("/register") },
    ]);
  };

  // ── Build the UPI link on the device and show the QR (no service call yet) ──
  const handleUpiPay = async () => {
    if (upiLoading) return;
    setUpiError("");
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setUpiError("Invalid amount. Please enter a valid amount.");
      return;
    }
    setUpiLoading(true);
    try {
      // Local-only auth check so we don't let the user pay and then fail to
      // record the booking on Confirm. No service API is called here.
      const profile = await TokenManager.getUserProfile();
      const token = await TokenManager.getToken();
      console.log('[UPI] profile.id =', profile.id, 'hasToken =', !!token);
      if (!profile.id || !token) {
        await handleAuthFailure();
        return;
      }

      // Build the UPI payment link locally from the amount + payee VPA.
      const tr = `SSS${Date.now()}`;
      const link = buildUpiLink(parsedAmount, tr);
      console.log('[UPI] built link =', link);
      setQrLink(link);
      setUpiAmount(parsedAmount);
      setBookingId(tr); // used as gateway_order_id when we finalize on Confirm
      setUpiStep("qr");

      // On a real device, redirect straight into the user's UPI app.
      // On web there is no UPI app to open, so we only show the QR to scan.
      if (Platform.OS !== "web") {
        Linking.openURL(encodeURI(link)).catch(() => {
          /* no UPI app installed — the QR below is the fallback */
        });
      }
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      console.error('[UPI] exception =', msg);
      setUpiError(`Error: ${msg}`);
    } finally {
      setUpiLoading(false);
    }
  };

  // ── Confirm: the ONLY service call. Ref filled → SUCCESS, blank → FAILED ──
  const handleConfirmUpiPayment = async () => {
    const parsedAmount = parseFloat(amount);
    const hasRef = transactionRef.trim().length > 0;
    setConfirmError("");
    setBooking(true);
    try {
      const profile = await TokenManager.getUserProfile();
      const payload: CreateBookingRequest = {
        user_id: profile.id,
        booking_for_id: params.providerId || "",
        service_id: params.serviceId || "",
        user_type: "GENERAL_USER",
        booking_type: "PANDIT",
        booking_date: buildBookingDate(),
        amount: parsedAmount || upiAmount,
        payment_status: hasRef ? "SUCCESS" : "FAILED",
        transaction_reference: hasRef ? transactionRef.trim() : "",
        gateway_payment_id: hasRef ? transactionRef.trim() : "",
        gateway_order_id: bookingId,
        collection_method: "UPI",
      };
      const res = await ApiService.createBooking(payload);
      if (res.success) {
        setBookingNumber(String(res.data?.booking_number ?? ""));
        setPaymentNo(String(res.data?.payment_no ?? ""));
        setPaid(true);
        setUpiStep("done");
      } else if (res.status === 401) {
        await handleAuthFailure();
      } else {
        // Backend rejects a blank/failed payment ("Payment was not successful.
        // Booking has not been created."). Show it and keep the user on the QR.
        setConfirmError(res.message);
      }
    } catch {
      setConfirmError("Something went wrong. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  // ── Card payment ──
  const handleCardPayment = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }
    setBooking(true);
    try {
      const profile = await TokenManager.getUserProfile();
      const payload: CreateBookingRequest = {
        user_id: profile.id,
        booking_for_id: params.providerId || "",
        service_id: params.serviceId || "",
        user_type: "GENERAL_USER",
        booking_type: "PANDIT",
        booking_date: buildBookingDate(),
        amount: parsedAmount,
        payment_status: "FAILED",
        transaction_reference: "",
        gateway_payment_id: "",
        gateway_order_id: "",
        collection_method: "CARD",
      };
      const res = await ApiService.createBooking(payload);
      if (res.success) {
        setPaid(true);
      } else if (res.status === 401) {
        await handleAuthFailure();
      } else {
        Alert.alert("Error", res.message);
      }
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  // ── Feedback submitted screen ──
  if (submitted) {
    return (
      <View style={[styles.root, { alignItems: "center", justifyContent: "center", padding: Spacing.five }]}>
        <View style={styles.successIcon}>
          <SymbolView name={{ ios: "checkmark.seal.fill", android: "verified", web: "verified" }} tintColor={BRAND.successText} size={48} />
        </View>
        <ThemedText style={styles.successTitle}>{t("feedbackThanksTitle")}</ThemedText>
        <ThemedText style={styles.successMsg}>{t("feedbackThanksMsg")}</ThemedText>
        <Pressable onPress={() => router.replace("/(tabs)/home")} style={({ pressed }) => [styles.cta, { marginTop: Spacing.four }, pressed && styles.pressed]}>
          <ThemedText style={styles.ctaText}>{t("backToHome")}</ThemedText>
        </Pressable>
      </View>
    );
  }

  // ── Feedback screen after payment ──
  if (paid) {
    return (
      <View style={styles.root}>
        <LinearGradient colors={[BRAND.primary, BRAND.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.header}>
          <SafeAreaView edges={["top"]} style={styles.headerInner}>
            <ThemedText style={styles.headerTitle}>{t("feedbackTitle")}</ThemedText>
          </SafeAreaView>
        </LinearGradient>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.card, { alignItems: "center", gap: 16 }]}>
            <View style={styles.successIcon}>
              <SymbolView name={{ ios: "checkmark.circle.fill", android: "check_circle", web: "check_circle" }} tintColor={BRAND.successText} size={40} />
            </View>
            <ThemedText style={styles.paymentSuccessText}>{t("paymentSuccessful")}</ThemedText>
            <ThemedText style={styles.paymentSuccessSubtitle}>{serviceLabel} {t("bookingConfirmedMsg")}</ThemedText>
            {(bookingNumber || paymentNo) ? (
              <View style={styles.paymentDetailBox}>
                {bookingNumber ? (
                  <View style={styles.paymentDetailRow}>
                    <ThemedText style={styles.paymentDetailLabel}>Booking Number</ThemedText>
                    <ThemedText style={styles.paymentDetailValue}>{bookingNumber}</ThemedText>
                  </View>
                ) : null}
                {paymentNo ? (
                  <View style={styles.paymentDetailRow}>
                    <ThemedText style={styles.paymentDetailLabel}>Payment No</ThemedText>
                    <ThemedText style={styles.paymentDetailValue}>{paymentNo}</ThemedText>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
          <View style={styles.card}>
            <ThemedText style={styles.sectionTitle}>{t("rateExperience")}</ThemedText>
            <ThemedText style={styles.feedbackSubtitle}>{t("rateExperienceSubtitle")}</ThemedText>
            <View style={styles.starsRow}>
              {RATINGS.map(r => (
                <Pressable key={r} onPress={() => setRating(r)} style={({ pressed }) => [pressed && styles.pressed]}>
                  <SymbolView
                    name={{ ios: rating >= r ? "star.fill" : "star", android: rating >= r ? "star" : "star_border", web: rating >= r ? "star" : "star_border" }}
                    tintColor={rating >= r ? "#F59E0B" : BRAND.textSecondary}
                    size={36}
                  />
                </Pressable>
              ))}
            </View>
            <ThemedText style={styles.feedbackSubtitle}>{t("feedbackComment")}</ThemedText>
            <TextInput
              value={feedback}
              onChangeText={setFeedback}
              placeholder={t("feedbackPlaceholder")}
              placeholderTextColor={BRAND.textSecondary}
              multiline
              numberOfLines={4}
              style={styles.feedbackInput}
            />
          </View>
          <Pressable onPress={() => setSubmitted(true)} style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
            <ThemedText style={styles.ctaText}>{t("submitFeedback")}</ThemedText>
          </Pressable>
          <Pressable onPress={() => router.replace("/(tabs)/home")} style={({ pressed }) => [styles.skipBtn, pressed && styles.pressed]}>
            <ThemedText style={styles.skipText}>{t("skipFeedback")}</ThemedText>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // ── UPI QR screen ──
  if (upiStep === "qr") {
    return (
      <View style={styles.root}>
        <LinearGradient colors={[BRAND.primary, BRAND.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.header}>
          <SafeAreaView edges={["top"]} style={styles.headerInner}>
            <Pressable onPress={() => setUpiStep("idle")} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
              <SymbolView name={{ ios: "chevron.left", android: "arrow_back", web: "arrow_back" }} tintColor="#FFFFFF" size={18} />
            </Pressable>
            <ThemedText style={styles.headerTitle}>UPI Payment</ThemedText>
          </SafeAreaView>
        </LinearGradient>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Amount */}
          <View style={styles.card}>
            <View style={styles.upiAmountRow}>
              <ThemedText style={styles.upiAmountLabel}>Amount to Pay</ThemedText>
              <ThemedText style={styles.upiAmountValue}>₹{upiAmount.toFixed(2)}</ThemedText>
            </View>
          </View>

          {/* Open UPI App — mobile only (a upi:// link can't open in a web browser) */}
          {Platform.OS !== "web" && (
            <View style={styles.card}>
              <ThemedText style={styles.sectionTitle}>Pay via UPI App</ThemedText>
              <ThemedText style={styles.upiHint}>
                Tap below to open your UPI app and complete the payment.
              </ThemedText>
              <Pressable
                onPress={() => Linking.openURL(encodeURI(qrLink)).catch(() => Alert.alert("Error", "Could not open UPI app."))}
                style={({ pressed }) => [styles.openUpiBtn, pressed && styles.pressed]}
              >
                <SymbolView name={{ ios: "iphone", android: "smartphone", web: "smartphone" }} tintColor="#FFFFFF" size={18} />
                <ThemedText style={styles.openUpiBtnText}>Open UPI App</ThemedText>
              </Pressable>
            </View>
          )}

          {/* QR Code */}
          <View style={styles.card}>
            <ThemedText style={styles.sectionTitle}>Scan QR to Pay</ThemedText>
            <View style={styles.qrBox}>
              <QrMatrix value={qrLink} size={220} />
              <ThemedText style={styles.qrHintText}>
                Scan with any UPI app (GPay, PhonePe, Paytm…)
              </ThemedText>
            </View>

            {/* Transaction Reference input */}
            <ThemedText style={styles.refLabel}>
              Transaction Reference ID{" "}
              <ThemedText style={styles.refOptional}>(optional)</ThemedText>
            </ThemedText>
            <TextInput
              value={transactionRef}
              onChangeText={setTransactionRef}
              placeholder="Enter UPI transaction reference ID"
              placeholderTextColor={BRAND.textSecondary}
              autoCapitalize="characters"
              style={styles.refInput}
            />
            <ThemedText style={styles.refHint}>
              {transactionRef.trim()
                ? "✓ Payment will be marked as SUCCESS"
                : "Leave blank to mark as FAILED (you can update later)"}
            </ThemedText>
          </View>

          <Pressable
            onPress={handleConfirmUpiPayment}
            disabled={booking}
            style={({ pressed }) => [styles.cta, booking && styles.ctaDisabled, pressed && !booking && styles.pressed]}
          >
            {booking ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <ThemedText style={styles.ctaText}>{t("confirmPayment")}</ThemedText>
            )}
          </Pressable>
          {confirmError ? (
            <View style={styles.errorBox}>
              <ThemedText style={styles.errorText}>{confirmError}</ThemedText>
            </View>
          ) : null}
        </ScrollView>
      </View>
    );
  }

  // ── Main payment screen ──
  return (
    <View style={styles.root}>
      <LinearGradient colors={[BRAND.primary, BRAND.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerInner}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
            <SymbolView name={{ ios: "chevron.left", android: "arrow_back", web: "arrow_back" }} tintColor="#FFFFFF" size={18} />
          </Pressable>
          <ThemedText style={styles.headerTitle}>{t("paymentTitle")}</ThemedText>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Booking Summary */}
        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>{t("bookingSummary")}</ThemedText>
          <SummaryRow label={t("service")} value={serviceLabel} />
          <SummaryRow label={t("provider")} value={providerLabel} />
          <SummaryRow label={t("dateAndTime")} value={dateTime} />
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <ThemedText style={styles.totalLabel}>{t("totalAmount")}</ThemedText>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="Enter amount"
              placeholderTextColor={BRAND.textSecondary}
              style={styles.amountInput}
            />
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>{t("paymentMethod")}</ThemedText>
          {PAYMENT_METHODS.map(m => (
            <Pressable
              key={m.key}
              onPress={() => setMethod(m.key)}
              style={({ pressed }) => [styles.methodRow, method === m.key && styles.methodRowSelected, pressed && styles.pressed]}
            >
              <View style={styles.methodIcon}>
                <SymbolView name={m.icon} tintColor={BRAND.primary} size={18} />
              </View>
              <ThemedText style={styles.methodText}>{t(m.key)}</ThemedText>
              {method === m.key && (
                <SymbolView name={{ ios: "checkmark.circle.fill", android: "check_circle", web: "check_circle" }} tintColor={BRAND.primary} size={18} />
              )}
            </Pressable>
          ))}
        </View>

        {/* CTA */}
        <Pressable
          onPress={() => {
            if (!method || upiLoading || booking) return;
            if (method === "upi") {
              handleUpiPay();
            } else {
              handleCardPayment();
            }
          }}
          style={({ pressed }) => [
            styles.cta,
            (!method || upiLoading || booking) && styles.ctaDisabled,
            pressed && !!method && !upiLoading && !booking && styles.pressed,
          ]}
        >
          {upiLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <ThemedText style={[styles.ctaText, !method && styles.ctaTextDisabled]}>
              {t("confirmPayment")}
            </ThemedText>
          )}
        </Pressable>
        {upiError ? (
          <View style={styles.errorBox}>
            <ThemedText style={styles.errorText}>{upiError}</ThemedText>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

// Renders a QR code from `value` using pure-JS bit matrix (no DOM/canvas/native module).
function QrMatrix({ value, size = 220 }: { value: string; size?: number }) {
  const qr = useMemo(() => {
    if (!value) return null;
    try {
      return QRCode.create(value, { errorCorrectionLevel: "M" });
    } catch (err) {
      console.error("[QR] create error:", err);
      return null;
    }
  }, [value]);

  if (!qr) {
    return (
      <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={BRAND.primary} />
      </View>
    );
  }

  const count = qr.modules.size;
  const data = qr.modules.data;
  const cell = Math.floor(size / count);
  const actual = cell * count;

  const rows = [];
  for (let r = 0; r < count; r++) {
    const cells = [];
    for (let c = 0; c < count; c++) {
      const dark = data[r * count + c];
      cells.push(
        <View
          key={c}
          style={{ width: cell, height: cell, backgroundColor: dark ? "#000000" : "#FFFFFF" }}
        />
      );
    }
    rows.push(
      <View key={r} style={{ flexDirection: "row" }}>
        {cells}
      </View>
    );
  }

  return <View style={{ width: actual, height: actual, backgroundColor: "#FFFFFF" }}>{rows}</View>;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <ThemedText style={styles.summaryLabel}>{label}</ThemedText>
      <ThemedText style={styles.summaryValue}>{value}</ThemedText>
    </View>
  );
}

function formatDate(iso: string) {
  const parts = iso.split("-");
  if (parts.length === 3) {
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },
  header: { paddingBottom: Spacing.three },
  headerInner: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.three, paddingTop: Spacing.two, gap: 12 },
  backBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#FFFFFF" },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.three, paddingBottom: Spacing.five, gap: Spacing.three },

  card: { backgroundColor: BRAND.card, borderWidth: 1, borderColor: BRAND.border, borderRadius: 14, padding: Spacing.three, gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: BRAND.text },

  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { fontSize: 13, color: BRAND.textSecondary },
  summaryValue: { fontSize: 13, fontWeight: "700", color: BRAND.text, flexShrink: 1, textAlign: "right" },
  divider: { height: 1, backgroundColor: BRAND.border },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: 15, fontWeight: "800", color: BRAND.text },
  amountInput: {
    fontSize: 18, fontWeight: "800", color: BRAND.primary,
    borderBottomWidth: 1, borderBottomColor: BRAND.border,
    paddingVertical: 4, minWidth: 100, textAlign: "right",
    ...(Platform.OS === "web" ? ({ outlineWidth: 0, outlineStyle: "none" } as object) : null),
  },

  methodRow: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: BRAND.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 },
  methodRowSelected: { borderColor: BRAND.primary, backgroundColor: BRAND.iconBg },
  methodIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: BRAND.iconBg, alignItems: "center", justifyContent: "center" },
  methodText: { flex: 1, fontSize: 14, fontWeight: "700", color: BRAND.text },

  cta: { backgroundColor: BRAND.primary, borderRadius: 12, height: 48, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6 },
  ctaDisabled: { backgroundColor: BRAND.disabledBg },
  ctaText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  ctaTextDisabled: { color: "#F5F0E5" },

  // UPI QR screen
  upiAmountRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  upiAmountLabel: { fontSize: 14, color: BRAND.textSecondary, fontWeight: "600" },
  upiAmountValue: { fontSize: 22, fontWeight: "800", color: BRAND.primary },
  upiHint: { fontSize: 13, color: BRAND.textSecondary, lineHeight: 18 },
  openUpiBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: BRAND.primary, borderRadius: 10, paddingVertical: 13,
  },
  openUpiBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  qrBox: {
    alignItems: "center", gap: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 12, borderWidth: 1, borderColor: BRAND.border,
    padding: 20,
  },
  qrHintText: { fontSize: 12, color: BRAND.textSecondary, textAlign: "center", lineHeight: 16 },
  refLabel: { fontSize: 13, fontWeight: "700", color: BRAND.text },
  refOptional: { fontSize: 12, fontWeight: "400", color: BRAND.textSecondary },
  refInput: {
    borderWidth: 1.5, borderColor: BRAND.inputBorder, borderRadius: 10,
    paddingHorizontal: 12, height: 46, fontSize: 14, color: BRAND.text,
    backgroundColor: "#FFFFFF",
    ...(Platform.OS === "web" ? ({ outlineWidth: 0, outlineStyle: "none" } as object) : null),
  },
  refHint: { fontSize: 12, color: BRAND.textSecondary, lineHeight: 16 },

  // Feedback / success
  skipBtn: { alignItems: "center", paddingVertical: 12 },
  skipText: { color: BRAND.textSecondary, fontSize: 14, fontWeight: "600" },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: BRAND.successBg, alignItems: "center", justifyContent: "center", alignSelf: "center" },
  successTitle: { fontSize: 20, fontWeight: "800", color: BRAND.text, textAlign: "center" },
  successMsg: { fontSize: 14, color: BRAND.textSecondary, textAlign: "center", marginTop: 4 },
  paymentSuccessText: { fontSize: 18, fontWeight: "800", color: BRAND.successText },
  paymentSuccessSubtitle: { fontSize: 13, color: BRAND.textSecondary, textAlign: "center" },
  paymentDetailBox: {
    alignSelf: "stretch", gap: 8, marginTop: 4,
    backgroundColor: BRAND.successBg, borderRadius: 10,
    borderWidth: 1, borderColor: "#BBF7D0", padding: 12,
  },
  paymentDetailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  paymentDetailLabel: { fontSize: 13, color: BRAND.textSecondary, fontWeight: "600" },
  paymentDetailValue: { fontSize: 14, color: BRAND.text, fontWeight: "800" },
  feedbackSubtitle: { fontSize: 13, color: BRAND.textSecondary },
  starsRow: { flexDirection: "row", gap: 8, justifyContent: "center" },
  feedbackInput: {
    borderWidth: 1, borderColor: BRAND.border, borderRadius: 10,
    padding: 12, fontSize: 14, color: BRAND.text,
    backgroundColor: "#FFFFFF", minHeight: 100, textAlignVertical: "top",
    ...(Platform.OS === "web" ? ({ outlineWidth: 0, outlineStyle: "none" } as object) : null),
  },
  pressed: { opacity: 0.85 },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorText: { fontSize: 13, color: "#DC2626", fontWeight: "600" },
});
