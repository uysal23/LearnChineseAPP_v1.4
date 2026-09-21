package com.liuxi.cince;

import android.Manifest;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import android.net.Uri;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.util.Base64;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.json.JSONObject;

public class MainActivity extends Activity implements TextToSpeech.OnInitListener {
    // Uygulama içeriği güvenli (https) bir sanal kökenden sunulur; mikrofon (getUserMedia) için gereklidir.
    private static final String HOST = "appassets.androidplatform.net";
    private static final int REQ_AUDIO = 77;
    private static final int REQ_NATIVE = 78;
    private RecBridge recBridge;
    private final ExecutorService assessPool = Executors.newSingleThreadExecutor();
    // Cihaz üzerinde telaffuz motoru: PronEngine uygulanıp buraya bağlanır (bkz. PronEngine.java).
    private final PronEngine engine = new NoEngine();

    private WebView web;
    private TextToSpeech tts;
    private volatile boolean ttsReady = false;
    private PermissionRequest pendingPerm;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        web = new WebView(this);
        web.setKeepScreenOn(true);
        setContentView(web);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if (HOST.equals(u.getHost())) {
                    String path = u.getPath();
                    if (path == null || path.isEmpty() || "/".equals(path)) path = "/index.html";
                    try {
                        InputStream in = getAssets().open(path.substring(1));
                        return new WebResourceResponse(mime(path), "UTF-8", in);
                    } catch (IOException e) {
                        return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found",
                                new HashMap<String, String>(), new ByteArrayInputStream(new byte[0]));
                    }
                }
                return super.shouldInterceptRequest(view, req);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                return !HOST.equals(req.getUrl().getHost());
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> {
                    boolean fromApp = HOST.equals(request.getOrigin().getHost());
                    boolean wantsAudio = false;
                    for (String r : request.getResources()) {
                        if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(r)) wantsAudio = true;
                    }
                    if (!fromApp || !wantsAudio) {
                        request.deny();
                        return;
                    }
                    if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                        request.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
                    } else {
                        pendingPerm = request;
                        requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQ_AUDIO);
                    }
                });
            }
        });
        tts = new TextToSpeech(this, this);
        web.addJavascriptInterface(new Bridge(), "AndroidTTS");
        recBridge = new RecBridge();
        web.addJavascriptInterface(recBridge, "AndroidREC");
        web.addJavascriptInterface(new AssessBridge(), "AndroidASSESS");
        web.loadUrl("https://" + HOST + "/index.html");
    }

    private static String mime(String p) {
        if (p.endsWith(".html")) return "text/html";
        if (p.endsWith(".js")) return "application/javascript";
        if (p.endsWith(".css")) return "text/css";
        if (p.endsWith(".json")) return "application/json";
        if (p.endsWith(".png")) return "image/png";
        if (p.endsWith(".svg")) return "image/svg+xml";
        return "application/octet-stream";
    }

    @Override
    public void onRequestPermissionsResult(int code, String[] perms, int[] res) {
        super.onRequestPermissionsResult(code, perms, res);
        if (code == REQ_NATIVE) {
            boolean g = res.length > 0 && res[0] == PackageManager.PERMISSION_GRANTED;
            web.evaluateJavascript("window.__recPerm && window.__recPerm(" + g + ")", null);
            return;
        }
        if (code == REQ_AUDIO && pendingPerm != null) {
            if (res.length > 0 && res[0] == PackageManager.PERMISSION_GRANTED) {
                pendingPerm.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
            } else {
                pendingPerm.deny();
            }
            pendingPerm = null;
        }
    }

    @Override
    public void onInit(int status) {
        if (status != TextToSpeech.SUCCESS) {
            ttsReady = false;
            return;
        }
        int r = tts.setLanguage(Locale.SIMPLIFIED_CHINESE);
        ttsReady = (r != TextToSpeech.LANG_MISSING_DATA && r != TextToSpeech.LANG_NOT_SUPPORTED);
        tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override public void onStart(String id) { }
            @Override public void onDone(String id) { done(); }
            @Override public void onError(String id) { done(); }
        });
        if (!ttsReady) {
            runOnUiThread(() -> Toast.makeText(MainActivity.this,
                "Çince ses verisi yok. Ayarlar > Metin okuma > Google TTS > Çince ses indir.",
                Toast.LENGTH_LONG).show());
        }
    }

    private void done() {
        web.post(() -> web.evaluateJavascript("window.__ttsDone && window.__ttsDone()", null));
    }

    private class Bridge {
        @JavascriptInterface
        public boolean speak(final String text, final float rate, final float pitch) {
            if (!ttsReady) return false;
            runOnUiThread(() -> {
                tts.setSpeechRate(rate);
                tts.setPitch(pitch);
                tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "u" + System.nanoTime());
            });
            return true;
        }

        @JavascriptInterface
        public void stop() {
            runOnUiThread(() -> tts.stop());
        }

        @JavascriptInterface
        public boolean isReady() {
            return ttsReady;
        }
    }

    // Yerel ses kaydı: 16 kHz mono PCM16 → WAV (Base64). Yalnızca kullanıcı eylemiyle başlar.
    private class RecBridge {
        private AudioRecord rec;
        private Thread thr;
        private ByteArrayOutputStream pcm;
        private volatile boolean running = false;

        @JavascriptInterface
        public boolean hasPermission() {
            return checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;
        }

        @JavascriptInterface
        public void requestPermission() {
            runOnUiThread(() -> requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQ_NATIVE));
        }

        @JavascriptInterface
        public synchronized String start() {
            try {
                cancel();
                final int sr = 16000;
                int min = AudioRecord.getMinBufferSize(sr, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT);
                if (min <= 0) return "bad_buffer:" + min;
                AudioRecord r = new AudioRecord(MediaRecorder.AudioSource.MIC, sr,
                        AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT, Math.max(min * 2, sr));
                if (r.getState() != AudioRecord.STATE_INITIALIZED) {
                    r.release();
                    return "init_failed";
                }
                rec = r;
                pcm = new ByteArrayOutputStream();
                running = true;
                r.startRecording();
                thr = new Thread(() -> {
                    byte[] buf = new byte[4096];
                    while (running) {
                        int n = r.read(buf, 0, buf.length);
                        if (n > 0) {
                            synchronized (pcm) { pcm.write(buf, 0, n); }
                        } else if (n < 0) {
                            break;
                        }
                    }
                });
                thr.start();
                return "ok";
            } catch (Exception e) {
                return "exception:" + e.getClass().getSimpleName();
            }
        }

        @JavascriptInterface
        public synchronized String stop() {
            if (rec == null) return "";
            running = false;
            try { if (thr != null) thr.join(500); } catch (InterruptedException ignored) { }
            try { rec.stop(); } catch (Exception ignored) { }
            rec.release();
            rec = null;
            byte[] data;
            synchronized (pcm) { data = pcm.toByteArray(); }
            pcm = null;
            return Base64.encodeToString(wav(data, 16000), Base64.NO_WRAP);
        }

        @JavascriptInterface
        public synchronized void cancel() {
            running = false;
            if (rec != null) {
                try { rec.stop(); } catch (Exception ignored) { }
                rec.release();
                rec = null;
            }
            pcm = null;
        }

        private byte[] wav(byte[] d, int sr) {
            ByteArrayOutputStream o = new ByteArrayOutputStream(44 + d.length);
            int len = d.length;
            byte[] h = new byte[44];
            put(h, 0, "RIFF"); le32(h, 4, 36 + len); put(h, 8, "WAVE"); put(h, 12, "fmt ");
            le32(h, 16, 16); le16(h, 20, 1); le16(h, 22, 1); le32(h, 24, sr); le32(h, 28, sr * 2);
            le16(h, 32, 2); le16(h, 34, 16); put(h, 36, "data"); le32(h, 40, len);
            o.write(h, 0, 44); o.write(d, 0, len);
            return o.toByteArray();
        }
        private void put(byte[] b, int o, String s) { for (int i = 0; i < s.length(); i++) b[o + i] = (byte) s.charAt(i); }
        private void le32(byte[] b, int o, int v) { b[o] = (byte) v; b[o + 1] = (byte) (v >> 8); b[o + 2] = (byte) (v >> 16); b[o + 3] = (byte) (v >> 24); }
        private void le16(byte[] b, int o, int v) { b[o] = (byte) v; b[o + 1] = (byte) (v >> 8); }
    }

    // Yerel değerlendirme köprüsü. Motor kurulu değilse isReady()=false döner ve uygulama sunucuya/beklemeye düşer.
    private class AssessBridge {
        @JavascriptInterface
        public boolean isReady() {
            return engine.isReady();
        }

        @JavascriptInterface
        public void assessAsync(final String id, final String referenceText, final String wavBase64) {
            assessPool.execute(() -> {
                String out;
                try {
                    byte[] wav = Base64.decode(wavBase64, Base64.DEFAULT);
                    out = engine.assess(referenceText, wav);
                } catch (Throwable t) {
                    out = "{\"ok\":false,\"error\":\"" + t.getClass().getSimpleName() + "\"}";
                }
                final String js = "window.__assessDone && window.__assessDone(" + JSONObject.quote(id) + "," + JSONObject.quote(out) + ")";
                web.post(() -> web.evaluateJavascript(js, null));
            });
        }
    }

    @Override
    public void onBackPressed() {
        web.evaluateJavascript("window.__back ? window.__back() : false", value -> {
            if (!"true".equals(value)) {
                MainActivity.super.onBackPressed();
            }
        });
    }

    @Override
    protected void onPause() {
        // Arka plana geçince mikrofonu kapat.
        web.evaluateJavascript("window.__pause && window.__pause()", null);
        if (recBridge != null) recBridge.cancel();
        web.onPause();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
    }

    @Override
    protected void onDestroy() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }
        super.onDestroy();
    }
}
