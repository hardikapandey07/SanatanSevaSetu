import type { StyleProp, ViewStyle } from 'react-native';

export type RazorpayWebViewProps = {
  html: string;
  onMessage?: (event: { nativeEvent: { data: string } }) => void;
  style?: StyleProp<ViewStyle>;
};
