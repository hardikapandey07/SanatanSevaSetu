import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { useT } from '@/i18n/LanguageContext';

const BRAND = {
  primary: '#E8731C',
  primaryDark: '#C95A0E',
  bg: '#FFFFFF',
  text: '#1F1A14',
  textSecondary: '#6B6258',
  success: '#16A34A',
  error: '#DC2626',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

type MessageType = 'success' | 'error' | 'info';

const ACCENT: Record<MessageType, string> = {
  success: BRAND.success,
  error: BRAND.error,
  info: BRAND.primary,
};

const ICON_BG: Record<MessageType, string> = {
  success: '#F0F9FF',
  error: '#FEF2F2',
  info: '#FFF1DE',
};

const ICONS: Record<MessageType, { ios: string; android: string; web: string }> = {
  success: { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' },
  error: { ios: 'exclamationmark.triangle.fill', android: 'error', web: 'error' },
  info: { ios: 'calendar', android: 'event', web: 'event' },
};

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: MessageType;
};

export function MessageModal({ visible, onClose, title, message, type }: Props) {
  const t = useT();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={[styles.iconContainer, { backgroundColor: ICON_BG[type] }]}>
            <SymbolView
              name={ICONS[type] as never}
              tintColor={ACCENT[type]}
              size={32}
            />
          </View>
          
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={styles.message}>{message}</ThemedText>
          
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: ACCENT[type] },
              pressed && styles.buttonPressed,
            ]}
          >
            <ThemedText style={styles.buttonText}>{t('okBtn')}</ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: BRAND.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  modal: {
    backgroundColor: BRAND.bg,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: BRAND.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: BRAND.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});