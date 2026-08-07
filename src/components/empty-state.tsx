import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

type Props = {
  message: string;
  subMessage?: string;
};

export function EmptyState({ message, subMessage }: Props) {
  return (
    <View style={styles.wrap}>
      <Image
        source={require('@/assets/images/logo1.jpg')}
        style={styles.img}
        contentFit="contain"
      />
      <ThemedText style={styles.sorry}>Sorry!</ThemedText>
      <ThemedText style={styles.message}>{message}</ThemedText>
      {!!subMessage && <ThemedText style={styles.sub}>{subMessage}</ThemedText>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 8,
  },
  img: {
    width: 90,
    height: 90,
    borderRadius: 18,
    marginBottom: 4,
    opacity: 0.85,
  },
  sorry: {
    fontSize: 18,
    fontWeight: '800',
    color: '#E8731C',
    marginTop: 2,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B6258',
    textAlign: 'center',
    lineHeight: 20,
  },
  sub: {
    fontSize: 12,
    color: '#9A9085',
    textAlign: 'center',
  },
});
