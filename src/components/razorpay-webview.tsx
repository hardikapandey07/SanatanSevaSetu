// Native (iOS + Android) — uses react-native-webview
import { WebView } from 'react-native-webview';
import type { RazorpayWebViewProps } from './razorpay-webview-types';

export function RazorpayWebView({ html, onMessage, style }: RazorpayWebViewProps) {
  return (
    <WebView
      source={{ html }}
      originWhitelist={['https://*.razorpay.com', 'https://checkout.razorpay.com', 'about:blank', 'data:*']}
      javaScriptEnabled
      domStorageEnabled
      onMessage={onMessage}
      style={style}
    />
  );
}
