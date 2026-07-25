// Web platform — react-native-webview is not supported on web.
// Renders an iframe with the Razorpay HTML directly in the page.
import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import type { RazorpayWebViewProps } from './razorpay-webview-types';

export function RazorpayWebView({ html, onMessage, style }: RazorpayWebViewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!event.data) return;
      try {
        const data = typeof event.data === 'string' ? event.data : JSON.stringify(event.data);
        // Simulate the RN WebView onMessage event shape
        onMessage?.({ nativeEvent: { data } } as any);
      } catch {}
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onMessage]);

  useEffect(() => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  }, [html]);

  return (
    <View style={[{ flex: 1 }, style]}>
      <iframe
        ref={iframeRef}
        style={{ flex: 1, width: '100%', height: '100%', border: 'none' }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
        title="Razorpay Payment"
      />
    </View>
  );
}
