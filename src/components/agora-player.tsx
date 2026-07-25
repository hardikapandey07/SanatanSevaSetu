// Mobile (Android + iOS) — uses react-native-webview
import { WebView } from 'react-native-webview';
import { StyleSheet, View } from 'react-native';

function buildHtml(appId: string, channel: string, token: string) {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#000;height:100vh;display:flex;align-items:center;justify-content:center;font-family:sans-serif;color:#fff}
  #vc{width:100%;height:100%;position:relative}
  #st{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center}
  .sp{width:40px;height:40px;border:3px solid rgba(255,255,255,.2);border-top-color:#E8731C;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 10px}
  @keyframes spin{to{transform:rotate(360deg)}}
  #er{display:none;color:#ff6b6b;font-size:13px;padding:20px;text-align:center}
</style>
</head>
<body>
<div id="vc">
  <div id="st"><div class="sp"></div><p style="font-size:13px;opacity:.7">Connecting…</p></div>
  <div id="er"></div>
</div>
<script src="https://download.agora.io/sdk/release/AgoraRTC_N-4.22.0.js"></script>
<script>
(async()=>{
  const appId=${JSON.stringify(appId)},channel=${JSON.stringify(channel)},token=${JSON.stringify(token||null)};
  const client=AgoraRTC.createClient({mode:'live',codec:'vp8'});
  await client.setClientRole('audience');
  client.on('user-published',async(u,t)=>{
    await client.subscribe(u,t);
    document.getElementById('st').style.display='none';
    if(t==='video') u.videoTrack.play(document.getElementById('vc'));
    if(t==='audio') u.audioTrack.play();
  });
  client.on('user-unpublished',()=>{
    document.getElementById('st').style.display='flex';
    document.getElementById('st').innerHTML='<p style="opacity:.6">Host paused the stream…</p>';
  });
  try{ await client.join(appId,channel,token,null); }
  catch(e){
    document.getElementById('st').style.display='none';
    const er=document.getElementById('er');
    er.style.display='block';
    er.textContent='Connection error: '+(e.message||e);
  }
})();
</script>
</body>
</html>`;
}

export default function AgoraPlayer({ appId, channel, token }: { appId: string; channel: string; token: string }) {
  return (
    <View style={styles.container}>
      <WebView
        source={{ html: buildHtml(appId, channel, token) }}
        style={styles.webview}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        originWhitelist={['*']}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  webview: { flex: 1, backgroundColor: '#000' },
});
