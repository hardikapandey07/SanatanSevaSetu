import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { SymbolView } from 'expo-symbols';
import QRCode from 'qrcode';
import { useMemo, useState, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AgoraPlayer from '@/components/agora-player';
import { ThemedText } from '@/components/themed-text';
import { ApiService, type BroadcastAccessResponse, type StreamInfo } from '@/constants/api';
import { Spacing } from '@/constants/theme';
import { useTranslatedBatch } from '@/i18n/LanguageContext';

const BRAND = {
  primary: '#E8731C',
  primaryDark: '#C95A0E',
  bg: '#F7F4EE',
  card: '#FFFFFF',
  border: '#EFE7D7',
  text: '#1F1A14',
  textSecondary: '#6B6258',
  inputBorder: '#E5DCC8',
  successBg: '#F0FFF4',
  successText: '#16A34A',
  errorBg: '#FEE2E2',
  errorText: '#DC2626',
};

type Screen = 'loading' | 'payment' | 'stream' | 'error';

export default function WebinarWatchScreen() {
  const { id, title, sub_title } = useLocalSearchParams<{
    id: string; title?: string; sub_title?: string;
  }>();

  const [screen, setScreen] = useState<Screen>('loading');
  const [accessData, setAccessData] = useState<BroadcastAccessResponse | null>(null);
  const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [utr, setUtr] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifySuccess, setVerifySuccess] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [comments, setComments] = useState<{ id: string; text: string; time: string }[]>([]);
  const [commentText, setCommentText] = useState('');
  const commentListRef = useRef<FlatList>(null);
  const [isLandscape, setIsLandscape] = useState(
    () => Dimensions.get('window').width > Dimensions.get('window').height
  );

  // Listen for physical device rotation
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = ScreenOrientation.addOrientationChangeListener(evt => {
      const o = evt.orientationInfo.orientation;
      const landscape =
        o === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        o === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;
      setIsLandscape(landscape);
      // Physical rotation to landscape auto-enters fullscreen
      if (landscape) setIsFullscreen(true);
      else setIsFullscreen(false);
    });
    return () => ScreenOrientation.removeOrientationChangeListener(sub);
  }, []);

  // Lock / unlock orientation when fullscreen button tapped
  const toggleFullscreen = async () => {
    if (Platform.OS === 'web') { setIsFullscreen(f => !f); return; }
    if (!isFullscreen) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      setIsFullscreen(true);
      setIsLandscape(true);
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      setIsFullscreen(false);
      setIsLandscape(false);
    }
  };

  // Restore portrait when leaving screen
  useEffect(() => {
    return () => {
      if (Platform.OS !== 'web') {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
      }
    };
  }, []);

  const [translatedTitle, translatedSubTitle] = useTranslatedBatch([title, sub_title]);
  const [translatedEventTitle, translatedSpeakerName] = useTranslatedBatch([
    streamInfo?.event_title, streamInfo?.speaker_name,
  ]);

  useEffect(() => { checkAccess(); }, [id]);

  const checkAccess = async () => {
    if (!id) { setErrorMsg('Invalid event.'); setScreen('error'); return; }
    setScreen('loading');
    const res = await ApiService.getBroadcastAccess(id);
    if (!res.data) { setErrorMsg('Could not check access. Please try again.'); setScreen('error'); return; }
    const data = res.data;
    setAccessData(data);
    const canStream = data.action === 'allow_stream' || data.status === 'authorized' || data.status === 'subscribed';
    if (canStream) { await loadStreamInfo(); } else { setScreen('payment'); }
  };

  const loadStreamInfo = async () => {
    setScreen('loading');
    const res = await ApiService.getStreamInfo(id);
    if (res.success && res.data) { setStreamInfo(res.data); setScreen('stream'); }
    else { setErrorMsg('Could not load stream. Please try again.'); setScreen('error'); }
  };

  const handleSendComment = () => {
    const text = commentText.trim();
    if (!text) return;
    const now = new Date();
    const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    setComments(prev => [...prev, { id: Date.now().toString(), text, time }]);
    setCommentText('');
    setTimeout(() => commentListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleVerifyPayment = async () => {
    if (!utr.trim()) { setVerifyError('Please enter the UTR / Transaction ID.'); return; }
    setVerifying(true); setVerifyError(''); setVerifySuccess('');
    const res = await ApiService.verifyBroadcastPayment({
      event_id: id, payment_collected_for: 'EVENT BOOKING', utr: utr.trim(),
    });
    setVerifying(false);
    if (res.success) {
      setVerifySuccess(res.data?.message ?? 'Payment verified! Loading stream…');
      setTimeout(() => checkAccess(), 1500);
    } else { setVerifyError(res.message); }
  };

  // ── Loading ──
  if (screen === 'loading') {
    return (
      <View style={styles.centeredRoot}>
        <SafeAreaView edges={['top']} style={styles.topBarAbs}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtnDark, pressed && styles.pressed]}>
            <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} tintColor={BRAND.text} size={18} />
          </Pressable>
        </SafeAreaView>
        <ActivityIndicator size="large" color={BRAND.primary} />
        <ThemedText style={styles.loadingText}>Checking access…</ThemedText>
      </View>
    );
  }

  // ── Error ──
  if (screen === 'error') {
    return (
      <View style={styles.centeredRoot}>
        <SafeAreaView edges={['top']} style={styles.topBarAbs}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtnDark, pressed && styles.pressed]}>
            <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} tintColor={BRAND.text} size={18} />
          </Pressable>
        </SafeAreaView>
        <SymbolView name={{ ios: 'exclamationmark.circle', android: 'error_outline', web: 'error_outline' }} tintColor={BRAND.errorText} size={48} />
        <ThemedText style={styles.errorTitle}>Something went wrong</ThemedText>
        <ThemedText style={styles.errorMsg}>{errorMsg}</ThemedText>
        <Pressable onPress={checkAccess} style={({ pressed }) => [styles.cta, { marginTop: 20 }, pressed && styles.pressed]}>
          <ThemedText style={styles.ctaText}>Retry</ThemedText>
        </Pressable>
      </View>
    );
  }

  // ── Payment required ──
  if (screen === 'payment') {
    const upiUrl = accessData?.initiate_payment_url ?? '';
    const amount = upiUrl.match(/am=([\d.]+)/)?.[1] ?? '';
    return (
      <View style={styles.root}>
        <LinearGradient colors={[BRAND.primary, BRAND.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.header}>
          <SafeAreaView edges={['top']} style={styles.headerInner}>
            <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.headerBackBtn, pressed && styles.pressed]}>
              <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} tintColor="#FFFFFF" size={18} />
            </Pressable>
            <ThemedText style={styles.headerTitle} numberOfLines={1}>{translatedTitle || 'Live Event'}</ThemedText>
          </SafeAreaView>
        </LinearGradient>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.eventInfoRow}>
              <View style={styles.livePill}><View style={styles.liveDot} /><ThemedText style={styles.livePillText}>LIVE</ThemedText></View>
              {!!amount && <View style={styles.pricePill}><ThemedText style={styles.priceText}>₹{amount}</ThemedText></View>}
            </View>
            <ThemedText style={styles.eventTitle}>{translatedTitle || 'Live Event'}</ThemedText>
            {!!sub_title && <ThemedText style={styles.eventSubtitle}>{translatedSubTitle}</ThemedText>}
          </View>

          <View style={[styles.card, styles.paymentNoticeCard]}>
            <SymbolView name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }} tintColor={BRAND.primary} size={28} />
            <ThemedText style={styles.paymentNoticeTitle}>Payment Required</ThemedText>
            <ThemedText style={styles.paymentNoticeDesc}>Complete the payment below to watch this live stream.</ThemedText>
          </View>

          {Platform.OS !== 'web' && !!upiUrl && (
            <View style={styles.card}>
              <ThemedText style={styles.sectionTitle}>Pay via UPI App</ThemedText>
              <ThemedText style={styles.hint}>Tap below to open your UPI app and complete the payment.</ThemedText>
              <Pressable onPress={() => Linking.openURL(encodeURI(upiUrl)).catch(() => {})} style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
                <SymbolView name={{ ios: 'iphone', android: 'smartphone', web: 'smartphone' }} tintColor="#FFFFFF" size={16} />
                <ThemedText style={styles.ctaText}>Open UPI App</ThemedText>
              </Pressable>
            </View>
          )}

          {!!upiUrl && (
            <View style={styles.card}>
              <ThemedText style={styles.sectionTitle}>Scan QR to Pay</ThemedText>
              <View style={styles.qrBox}>
                <QrMatrix value={upiUrl} size={200} />
                <ThemedText style={styles.qrHint}>Scan with GPay, PhonePe, Paytm or any UPI app</ThemedText>
              </View>
            </View>
          )}

          <View style={styles.card}>
            <ThemedText style={styles.sectionTitle}>Verify Payment</ThemedText>
            <ThemedText style={styles.hint}>After paying, enter your UTR / Transaction Reference ID to unlock the stream.</ThemedText>
            <TextInput
              value={utr} onChangeText={setUtr}
              placeholder="Enter UTR / Transaction ID"
              placeholderTextColor={BRAND.textSecondary}
              autoCapitalize="characters"
              style={styles.input}
            />
            {!!verifyError && <View style={styles.errorBox}><ThemedText style={styles.errorBoxText}>{verifyError}</ThemedText></View>}
            {!!verifySuccess && <View style={styles.successBox}><ThemedText style={styles.successBoxText}>{verifySuccess}</ThemedText></View>}
            <Pressable onPress={handleVerifyPayment} disabled={verifying} style={({ pressed }) => [styles.cta, verifying && styles.ctaDisabled, pressed && !verifying && styles.pressed]}>
              {verifying ? <ActivityIndicator color="#FFFFFF" size="small" /> : <ThemedText style={styles.ctaText}>Verify & Watch</ThemedText>}
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Stream ──
  return (
    <View style={styles.root}>
      {!isFullscreen && !isLandscape && (
        <LinearGradient colors={[BRAND.primary, BRAND.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.header}>
          <SafeAreaView edges={['top']} style={styles.headerInner}>
            <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.headerBackBtn, pressed && styles.pressed]}>
              <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} tintColor="#FFFFFF" size={18} />
            </Pressable>
            <ThemedText style={styles.headerTitle} numberOfLines={1}>{translatedEventTitle || translatedTitle || 'Live Stream'}</ThemedText>
            <View style={styles.livePillSmall}><View style={styles.liveDot} /><ThemedText style={styles.livePillText}>LIVE</ThemedText></View>
          </SafeAreaView>
        </LinearGradient>
      )}

      {/* Agora player — same HTML, WebView on mobile, iframe on web */}
      <View style={[styles.playerContainer, (isFullscreen || isLandscape) && styles.playerFullscreen]}>
        <AgoraPlayer
          appId={streamInfo?.agora_app_id ?? ''}
          channel={streamInfo?.agora_channel_name ?? ''}
          token={streamInfo?.agora_token ?? ''}
        />
        {/* Fullscreen toggle button */}
        <Pressable
          onPress={toggleFullscreen}
          style={({ pressed }) => [styles.fullscreenBtn, pressed && styles.pressed]}>
          <SymbolView
            name={
              isFullscreen
                ? { ios: 'arrow.down.right.and.arrow.up.left', android: 'fullscreen_exit', web: 'fullscreen_exit' }
                : { ios: 'arrow.up.left.and.arrow.down.right', android: 'fullscreen', web: 'fullscreen' }
            }
            tintColor="#FFFFFF"
            size={18}
          />
        </Pressable>
        {/* Back button visible in fullscreen or landscape */}
        {(isFullscreen || isLandscape) && (
          <SafeAreaView edges={['top']} style={styles.fullscreenTopBar}>
            <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.headerBackBtn, pressed && styles.pressed]}>
              <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} tintColor="#FFFFFF" size={18} />
            </Pressable>
            <ThemedText style={styles.fullscreenTitle} numberOfLines={1}>{translatedEventTitle || translatedTitle}</ThemedText>
            <View style={styles.livePillSmall}><View style={styles.liveDot} /><ThemedText style={styles.livePillText}>LIVE</ThemedText></View>
          </SafeAreaView>
        )}
      </View>

      {!isFullscreen && !isLandscape && (
        <KeyboardAvoidingView
          style={styles.scroll}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}>
          <ScrollView contentContainerStyle={styles.infoContent} showsVerticalScrollIndicator={false}>
            {/* Host info card */}
            <View style={styles.card}>
              <ThemedText style={styles.streamTitle}>{translatedEventTitle || translatedTitle}</ThemedText>
              {!!streamInfo?.speaker_name && (
                <View style={styles.hostRow}>
                  <View style={styles.hostAvatar}>
                    <ThemedText style={styles.hostAvatarText}>{streamInfo.speaker_name.charAt(0)}</ThemedText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.hostedBy}>Hosted by</ThemedText>
                    <ThemedText style={styles.hostName}>{translatedSpeakerName}</ThemedText>
                  </View>
                  {!!streamInfo.viewer_count && (
                    <View style={styles.viewerBadge}>
                      <ThemedText style={styles.viewerText}>👁 {streamInfo.viewer_count} watching</ThemedText>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Comments section */}
            <View style={styles.commentsCard}>
              <View style={styles.commentsTitleRow}>
                <ThemedText style={styles.commentsTitle}>💬 Live Comments</ThemedText>
                <View style={styles.commentCountBadge}>
                  <ThemedText style={styles.commentCountText}>{comments.length}</ThemedText>
                </View>
              </View>

              {comments.length === 0 ? (
                <View style={styles.emptyComments}>
                  <ThemedText style={styles.emptyCommentsText}>Be the first to comment! 🙏</ThemedText>
                </View>
              ) : (
                <FlatList
                  ref={commentListRef}
                  data={comments}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <View style={styles.commentItem}>
                      <View style={styles.commentAvatar}>
                        <ThemedText style={styles.commentAvatarText}>🙏</ThemedText>
                      </View>
                      <View style={styles.commentBody}>
                        <ThemedText style={styles.commentText}>{item.text}</ThemedText>
                        <ThemedText style={styles.commentTime}>{item.time}</ThemedText>
                      </View>
                    </View>
                  )}
                  ItemSeparatorComponent={() => <View style={styles.commentDivider} />}
                />
              )}
            </View>
          </ScrollView>

          {/* Comment input bar */}
          <SafeAreaView edges={['bottom']} style={styles.commentInputBar}>
            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Write a comment… 🙏"
              placeholderTextColor={BRAND.textSecondary}
              style={styles.commentInput}
              returnKeyType="send"
              onSubmitEditing={handleSendComment}
              blurOnSubmit={false}
              maxLength={200}
              {...(Platform.OS === 'web' ? ({ outlineWidth: 0, outlineStyle: 'none' } as object) : null)}
            />
            <Pressable
              onPress={handleSendComment}
              disabled={!commentText.trim()}
              style={({ pressed }) => [
                styles.sendBtn,
                !commentText.trim() && styles.sendBtnDisabled,
                pressed && commentText.trim() && styles.pressed,
              ]}>
              <SymbolView
                name={{ ios: 'paperplane.fill', android: 'send', web: 'send' }}
                tintColor="#FFFFFF"
                size={16}
              />
            </Pressable>
          </SafeAreaView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

function QrMatrix({ value, size = 200 }: { value: string; size?: number }) {
  const qr = useMemo(() => {
    if (!value) return null;
    try { return QRCode.create(value, { errorCorrectionLevel: 'M' }); }
    catch { return null; }
  }, [value]);

  if (!qr) return <ActivityIndicator size="large" color={BRAND.primary} />;
  const count = qr.modules.size;
  const cell = Math.floor(size / count);
  const actual = cell * count;
  const rows = [];
  for (let r = 0; r < count; r++) {
    const cells = [];
    for (let c = 0; c < count; c++) {
      cells.push(<View key={c} style={{ width: cell, height: cell, backgroundColor: qr.modules.data[r * count + c] ? '#000' : '#FFF' }} />);
    }
    rows.push(<View key={r} style={{ flexDirection: 'row' }}>{cells}</View>);
  }
  return <View style={{ width: actual, height: actual, backgroundColor: '#FFF' }}>{rows}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },
  centeredRoot: { flex: 1, backgroundColor: BRAND.bg, alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
  topBarAbs: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: Spacing.three, paddingTop: Spacing.two },
  backBtnDark: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.08)', alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: BRAND.textSecondary },
  errorTitle: { fontSize: 18, fontWeight: '800', color: BRAND.text, marginTop: 12, textAlign: 'center' },
  errorMsg: { fontSize: 13, color: BRAND.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 18 },

  header: { paddingBottom: Spacing.two },
  headerInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.three, paddingTop: Spacing.two, gap: 10 },
  headerBackBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  livePillSmall: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#DC2626', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },

  playerContainer: { height: 240, backgroundColor: '#000' },
  playerFullscreen: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    height: undefined, zIndex: 999,
  },
  fullscreenBtn: {
    position: 'absolute', bottom: 12, right: 12,
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center',
  },
  fullscreenTopBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.three, paddingTop: Spacing.two, gap: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  fullscreenTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: '#FFFFFF' },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.three, paddingBottom: Spacing.five, gap: Spacing.three },
  infoContent: { padding: Spacing.three, paddingBottom: Spacing.four, gap: Spacing.three },

  card: { backgroundColor: BRAND.card, borderRadius: 14, borderWidth: 1, borderColor: BRAND.border, padding: Spacing.three, gap: 10 },
  paymentNoticeCard: { alignItems: 'center', paddingVertical: 24 },

  eventInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#DC2626', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
  livePillText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  pricePill: { backgroundColor: BRAND.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  priceText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  eventTitle: { fontSize: 18, fontWeight: '800', color: BRAND.text },
  eventSubtitle: { fontSize: 13, color: BRAND.textSecondary },
  paymentNoticeTitle: { fontSize: 17, fontWeight: '800', color: BRAND.text, marginTop: 4 },
  paymentNoticeDesc: { fontSize: 13, color: BRAND.textSecondary, textAlign: 'center', lineHeight: 18 },

  sectionTitle: { fontSize: 15, fontWeight: '800', color: BRAND.text },
  hint: { fontSize: 13, color: BRAND.textSecondary, lineHeight: 18 },
  qrBox: { alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: BRAND.border, padding: 16 },
  qrHint: { fontSize: 12, color: BRAND.textSecondary, textAlign: 'center' },

  input: {
    borderWidth: 1.5, borderColor: BRAND.inputBorder, borderRadius: 10,
    paddingHorizontal: 12, height: 46, fontSize: 14, color: BRAND.text, backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' ? ({ outlineWidth: 0, outlineStyle: 'none' } as object) : null),
  },
  errorBox: { backgroundColor: BRAND.errorBg, borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#FCA5A5' },
  errorBoxText: { fontSize: 13, color: BRAND.errorText, fontWeight: '600' },
  successBox: { backgroundColor: BRAND.successBg, borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#BBF7D0' },
  successBoxText: { fontSize: 13, color: BRAND.successText, fontWeight: '600' },

  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: BRAND.primary, borderRadius: 12, height: 48 },
  ctaDisabled: { backgroundColor: '#CFC4B0' },
  ctaText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  // Comments
  commentsCard: {
    backgroundColor: BRAND.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BRAND.border,
    overflow: 'hidden',
  },
  commentsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  commentsTitle: { fontSize: 14, fontWeight: '800', color: BRAND.text, flex: 1 },
  commentCountBadge: {
    backgroundColor: '#FFF1DE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  commentCountText: { fontSize: 11, fontWeight: '700', color: BRAND.primary },
  emptyComments: { paddingVertical: 24, alignItems: 'center' },
  emptyCommentsText: { fontSize: 13, color: BRAND.textSecondary },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF1DE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: { fontSize: 14 },
  commentBody: { flex: 1, gap: 2 },
  commentText: { fontSize: 13, color: BRAND.text, lineHeight: 18 },
  commentTime: { fontSize: 10, color: BRAND.textSecondary },
  commentDivider: { height: 1, backgroundColor: BRAND.border, marginHorizontal: Spacing.three },
  commentInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: Spacing.three,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: BRAND.card,
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
  },
  commentInput: {
    flex: 1,
    height: 42,
    borderWidth: 1.5,
    borderColor: BRAND.inputBorder,
    borderRadius: 21,
    paddingHorizontal: 14,
    fontSize: 14,
    color: BRAND.text,
    backgroundColor: '#FAFAFA',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: BRAND.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#D0C4B0' },

  streamTitle: { fontSize: 17, fontWeight: '800', color: BRAND.text },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hostAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF1DE', borderWidth: 2, borderColor: BRAND.primary, alignItems: 'center', justifyContent: 'center' },
  hostAvatarText: { fontSize: 18, fontWeight: '800', color: BRAND.primary },
  hostedBy: { fontSize: 11, color: BRAND.textSecondary, fontWeight: '600' },
  hostName: { fontSize: 14, fontWeight: '800', color: BRAND.text },
  viewerBadge: { backgroundColor: '#FFF1DE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  viewerText: { fontSize: 12, fontWeight: '700', color: BRAND.primary },

  pressed: { opacity: 0.85 },
});
