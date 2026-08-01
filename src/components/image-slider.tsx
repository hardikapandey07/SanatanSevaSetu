import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';

const PRIMARY = '#E8731C';

type Slide = {
  id: string;
  uri: string;
  title?: string;
  description?: string;
  buttonText?: string;
};

type Props = {
  slides: Slide[];
  onPress?: (slide: Slide) => void;
  autoPlayMs?: number;
};

export function ImageSlider({ slides, onPress, autoPlayMs = 3000 }: Props) {
  const screenWidth = Dimensions.get('window').width;
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const indexRef = useRef(0);
  const pausedRef = useRef(false);
  const count = slides.length;
  const isWeb = Platform.OS === 'web';

  const effectiveWidth = width || (screenWidth - 32);
  const bannerHeight = Math.min(Math.round(effectiveWidth * (9 / 16)), 320);

  const goTo = (next: number) => {
    indexRef.current = next;
    setIndex(next);
    scrollRef.current?.scrollTo({ x: next * effectiveWidth, animated: true });
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / effectiveWidth);
    if (next !== indexRef.current && next >= 0 && next < count) {
      indexRef.current = next;
      setIndex(next);
    }
  };

  useEffect(() => {
    if (count < 2) return;
    const id = setInterval(() => {
      if (pausedRef.current) return;
      goTo((indexRef.current + 1) % count);
    }, autoPlayMs);
    return () => clearInterval(id);
  }, [count, effectiveWidth, autoPlayMs]);

  if (count === 0) {
    return (
      <View
        style={[styles.placeholder, { height: bannerHeight }]}
        onLayout={e => setWidth(e.nativeEvent.layout.width)}
      />
    );
  }

  const Overlay = ({ slide }: { slide: Slide }) =>
    slide.title || slide.description || slide.buttonText ? (
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.overlayInner}>
          <View style={{ flex: 1 }}>
            {!!slide.title && (
              <ThemedText style={styles.overlayTitle} numberOfLines={2}>
                {slide.title}
              </ThemedText>
            )}
            {!!slide.description && (
              <ThemedText style={styles.overlayDesc} numberOfLines={2}>
                {slide.description}
              </ThemedText>
            )}
          </View>
          {!!slide.buttonText && (
            <View style={styles.overlayBtn}>
              <ThemedText style={styles.overlayBtnText}>{slide.buttonText}</ThemedText>
            </View>
          )}
        </View>
      </View>
    ) : null;

  const Dots = () => (
    <View style={styles.dotsRow}>
      {slides.map((s, i) => (
        <Pressable key={s.id} onPress={() => goTo(i)}>
          <View style={[styles.dot, i === index && styles.dotActive]} />
        </Pressable>
      ))}
    </View>
  );

  const Arrows = ({ useIndexRef = false }: { useIndexRef?: boolean }) =>
    count > 1 ? (
      <>
        <Pressable
          onPress={() => goTo((useIndexRef ? indexRef.current : index - 1 + count) % count)}
          style={[styles.arrow, styles.arrowLeft]}
        >
          <ThemedText style={styles.arrowText}>‹</ThemedText>
        </Pressable>
        <Pressable
          onPress={() => goTo(((useIndexRef ? indexRef.current : index) + 1) % count)}
          style={[styles.arrow, styles.arrowRight]}
        >
          <ThemedText style={styles.arrowText}>›</ThemedText>
        </Pressable>
      </>
    ) : null;

  // Web: simple div-based slider
  if (isWeb) {
    return (
      <View style={styles.wrap} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
        <Pressable
          onPress={() => onPress?.(slides[index])}
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <View style={{ width: '100%', height: bannerHeight, borderRadius: 12, overflow: 'hidden' }}>
            <img
              src={slides[index].uri}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' } as any}
            />
            <View
              style={[StyleSheet.absoluteFill, { background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 55%)' } as any]}
              pointerEvents="none"
            />
            <Overlay slide={slides[index]} />
          </View>
        </Pressable>
        <Arrows />
        <Dots />
      </View>
    );
  }

  // Native: ScrollView-based slider
  return (
    <View style={styles.wrap} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onScrollBeginDrag={() => { pausedRef.current = true; }}
        onScrollEndDrag={() => { pausedRef.current = false; }}
        scrollEventThrottle={16}
        snapToInterval={effectiveWidth}
        decelerationRate="fast"
      >
        {slides.map(s => (
          <Pressable
            key={s.id}
            onPress={() => onPress?.(s)}
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <View style={{ position: 'relative', width: effectiveWidth, height: bannerHeight, borderRadius: 12, overflow: 'hidden' }}>
              <Image
                source={{ uri: s.uri }}
                style={{ width: effectiveWidth, height: bannerHeight }}
                contentFit="cover"
                contentPosition="center"
                transition={300}
                cachePolicy="memory-disk"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.72)']}
                start={{ x: 0, y: 0.3 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
              <Overlay slide={s} />
            </View>
          </Pressable>
        ))}
      </ScrollView>
      <Arrows useIndexRef />
      <Dots />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  placeholder: { borderRadius: 12, backgroundColor: '#E0D6C2', opacity: 0.4, width: '100%' },
  overlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 12, paddingBottom: 12, paddingTop: 32,
  },
  overlayInner: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  overlayTitle: {
    fontSize: 14, fontWeight: '800', color: '#FFFFFF', lineHeight: 19,
    textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },
  overlayDesc: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 3, fontWeight: '500' },
  overlayBtn: {
    backgroundColor: PRIMARY, paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 999, flexShrink: 0,
  },
  overlayBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  arrow: {
    position: 'absolute', top: '50%', marginTop: -20,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  arrowLeft: { left: 10 },
  arrowRight: { right: 10 },
  arrowText: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', lineHeight: 26 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E0CFB0' },
  dotActive: { width: 18, backgroundColor: PRIMARY },
  pressed: { opacity: 0.85 },
});
