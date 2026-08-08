import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { SymbolView } from 'expo-symbols';
import { useMemo, useState, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
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

import AgoraPlayer from '@/components/agora-player';
import { RazorpayWebView } from '@/components/razorpay-webview';
import { ThemedText } from '@/components/themed-text';
import { ApiService, TokenManager, type BroadcastAccessResponse, type BroadcastSubscribeResponse, type StreamInfo } from '@/constants/api';
import { ENV_CONFIG } from '@/constants/environment';
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
  // Razorpay
  const [razorpayOrder, setRazorpayOrder] = useState<BroadcastSubscribeResponse | null>(null);
  const [razorpayVisible, setRazorpayVisible] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [comments, setComments] = useState<{ id: string; text: string; time: string }[]>([]);
  const [commentText, setCommentText] = useState('');
  const commentListRef = useRef<FlatList>(null);
  const [isLandscape, setIsLandscape] = useState(
    () => Dimensions.get('window').width > Dimensions.get('window').height
  );

  // user profile for Razorpay prefill
  const [userMobile, setUserMobile] = useState('');
  const [userName, setUserName] = useState('');
  useEffect(() => {
    TokenManager.getUserProfile().then(p => {
      setUserMobile(p.mobile);
      setUserName(p.name);
    });
  }, []);

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
    // Step 1: check access
    const res = await ApiService.getBroadcastAccess(id);
    if (!res.data) { setErrorMsg('Could not check access. Please try again.'); setScreen('error'); return; }
    const data = res.data;
    setAccessData(data);
    const canStream = data.action === 'allow_stream' || data.status === 'authorized' || data.status === 'subscribed';
    if (canStream && !data.payment_required) {
      await loadStreamInfo();
      return;
    }
    // Step 2: unauthorized — call subscribe
    await processSubscribe();
  };

  const processSubscribe = async () => {
    setScreen('loading');
    const subRes = await ApiService.subscribeBroadcast(id);
    // Already booked or free access granted
    if (subRes.alreadyBooked || subRes.free) {
      await loadStreamInfo();
      return;
    }
    if (!subRes.success) {
      setErrorMsg(subRes.message || 'Failed to initiate booking.');
      setScreen('error');
      return;
    }
    // Has razorpay_order_id — show payment gateway
    if (subRes.data?.razorpay_order_id) {
      setRazorpayOrder(subRes.data);
      setRazorpayVisible(true);
      setScreen('payment');
      return;
    }
    // Fallback
    setErrorMsg('Unexpected response from server.');
    setScreen('error');
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

  // Razorpay checkout finished — verify the signature server-side, then re-check access.
  const handleRazorpayMessage = async (e: { nativeEvent: { data: string } }) => {
    let msg: any;
    try { msg = JSON.parse(e.nativeEvent.data); } catch { return; }

    if (msg.type === 'payment_success') {
      setRazorpayVisible(false);
      setScreen('loading');
      const verifyRes = await ApiService.verifyBroadcastRazorpayPayment({
        razorpay_order_id: msg.razorpay_order_id,
        razorpay_payment_id: msg.razorpay_payment_id,
        razorpay_signature: msg.razorpay_signature,
      });
      if (verifyRes.success) {
        await checkAccess();
      } else {
        setErrorMsg(verifyRes.message || 'Payment verification failed.');
        setScreen('error');
      }
    } else if (msg.type === 'payment_failed') {
      setRazorpayVisible(false);
      setScreen('payment');
      Alert.alert('Payment Failed', msg.description || 'Payment was not completed.');
    } else if (msg.type === 'payment_dismissed') {
      setRazorpayVisible(false);
      setScreen('payment');
    }
  };

  // Prefer the amount the subscribe API quoted; fall back to the UPI deep link.
  const payAmount = razorpayOrder?.amount != null
    ? String(razorpayOrder.amount)
    : (accessData?.initiate_payment_url ?? '').match(/am=([\d.]+)/)?.[1] ?? '';

  // Kept stable so the checkout page isn't re-written on unrelated re-renders.
  const razorpayHtml = useMemo(
    () => razorpayOrder?.razorpay_order_id
      ? buildRazorpayHtml(
          razorpayOrder.razorpay_order_id,
          Number(payAmount) || 0,
          translatedTitle || title || 'Live Stream Access',
          userName,
          userMobile,
        )
      : '',
    [razorpayOrder?.razorpay_order_id, payAmount, translatedTitle, title, userName, userMobile],
  );

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
    const amount = payAmount;
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

          <View style={styles.card}>
            <ThemedText style={styles.sectionTitle}>Secure Payment</ThemedText>
            <ThemedText style={styles.hint}>Pay securely via UPI, cards, net banking or wallets. Your stream unlocks automatically once the payment is confirmed.</ThemedText>
            <Pressable
              onPress={() => (razorpayOrder?.razorpay_order_id ? setRazorpayVisible(true) : processSubscribe())}
              style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
              <ThemedText style={styles.ctaText}>{amount ? `Pay ₹${amount}` : 'Pay Now'}</ThemedText>
            </Pressable>
          </View>
        </ScrollView>

        {/* Razorpay checkout — same WebView gateway used by the puja booking flow */}
        {!!razorpayOrder?.razorpay_order_id && (
          <Modal visible={razorpayVisible} animationType="slide" transparent onRequestClose={() => setRazorpayVisible(false)}>
            <View style={styles.rzpModalBackdrop}>
              <View style={styles.rzpModalContainer}>
                <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
                  <View style={styles.rzpHeader}>
                    <Pressable onPress={() => setRazorpayVisible(false)} style={({ pressed }) => [styles.rzpCloseBtn, pressed && styles.pressed]}>
                      <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} tintColor={BRAND.text} size={18} />
                    </Pressable>
                    <ThemedText style={styles.rzpHeaderTitle}>Complete Payment</ThemedText>
                  </View>
                  <RazorpayWebView
                    html={razorpayHtml}
                    style={{ flex: 1 }}
                    onMessage={handleRazorpayMessage}
                  />
                </SafeAreaView>
              </View>
            </View>
          </Modal>
        )}
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

function buildRazorpayHtml(
  orderId: string,
  amount: number,
  eventTitle: string,
  name: string,
  mobile: string,
): string {
  const key = ENV_CONFIG.RAZORPAY_KEY_ID;
  const amountInPaise = Math.round(amount * 100);
  const desc = eventTitle.replace(/["<>]/g, '').slice(0, 80) || 'Live Stream Access';
  const safeName = name.replace(/["<>]/g, '');
  const safeMobile = mobile.replace(/["<>]/g, '');
  const safeOrderId = String(orderId).trim();

  return (
    '<!DOCTYPE html><html><head>' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<style>' +
    'body{margin:0;background:#F7F4EE;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;gap:16px}' +
    '.title{font-size:16px;font-weight:700;color:#1F1A14}' +
    '.amt{font-size:26px;font-weight:900;color:#E8731C}' +
    '.desc{font-size:13px;color:#6B6258;padding:0 24px;text-align:center}' +
    '#rzp-button1{background:#E8731C;color:#fff;border:none;border-radius:12px;padding:16px 48px;font-size:16px;font-weight:700;cursor:pointer;letter-spacing:0.3px}' +
    '#rzp-button1:active{opacity:0.85}' +
    '</style></head><body>' +
    '<div class="title">Sanatan Seva Setu</div>' +
    '<div class="amt">₹' + amount.toLocaleString('en-IN') + '</div>' +
    '<div class="desc">' + desc + '</div>' +
    '<button id="rzp-button1">Pay Now</button>' +
    '<script src="https://checkout.razorpay.com/v1/checkout.js"><\/script>' +
    '<script>' +
    'function postMsg(d){var m=JSON.stringify(d);if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(m);}else{window.parent.postMessage(m,"*");}}' +
    'var options={' +
    '"key":"' + key + '",' +
    '"amount":"' + amountInPaise + '",' +
    '"currency":"INR",' +
    '"name":"Sanatan Seva Setu",' +
    '"description":"' + desc + '",' +
    '"order_id":"' + safeOrderId + '",' +
    '"prefill":{"name":"' + safeName + '","contact":"' + safeMobile + '"},' +
    '"notes":{"app":"SanatanSevaSetu"},' +
    '"theme":{"color":"#E8731C"},' +
    '"handler":function(r){postMsg({type:"payment_success",razorpay_order_id:r.razorpay_order_id,razorpay_payment_id:r.razorpay_payment_id,razorpay_signature:r.razorpay_signature});},' +
    '"modal":{"ondismiss":function(){postMsg({type:"payment_dismissed"});}}' +
    '};' +
    'var rzp1=new Razorpay(options);' +
    'document.getElementById("rzp-button1").onclick=function(e){rzp1.open();e.preventDefault();};' +
    'rzp1.on("payment.failed",function(r){postMsg({type:"payment_failed",description:r.error.description});});' +
    '<\/script></body></html>'
  );
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

  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: BRAND.primary, borderRadius: 12, height: 48 },
  ctaText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  rzpModalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  rzpModalContainer: { flex: 1, marginTop: 60, backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },
  rzpHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: Spacing.three, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: BRAND.border },
  rzpCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0EAE0', alignItems: 'center', justifyContent: 'center' },
  rzpHeaderTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: BRAND.text },

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
