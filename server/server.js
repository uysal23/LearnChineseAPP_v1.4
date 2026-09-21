// Telaffuz değerlendirme sunucusu — REFERANS UYGULAMA (Microsoft Azure Speech · Pronunciation Assessment)
// Yalnızca Node.js 18+ (yerleşik fetch/http). API anahtarı SADECE ortam değişkeninde durur; APK içine konmaz.
// UYARI: Bu dosya canlı Azure hesabıyla bu geliştirme ortamında denenmemiştir; yayına almadan önce
// Azure'un güncel "pronunciation assessment REST" dokümanına göre doğrulayın.
//
// Çalıştırma:
//   AZURE_SPEECH_KEY=... AZURE_SPEECH_REGION=westeurope APP_TOKEN=uzun-rastgele-bir-dize node server.js
// Uygulama https:// adresi bekler (Android WebView karışık içeriği engeller): sunucuyu TLS arkasında yayınlayın.
const http = require('http');
const KEY = process.env.AZURE_SPEECH_KEY, REGION = process.env.AZURE_SPEECH_REGION || 'westeurope';
const TOKEN = process.env.APP_TOKEN || '';
const ENGINE = 'azure-speech-pa', MODEL = 'zh-CN', VERSION = process.env.SCORING_VERSION || '2026-09-azure-pa-v1';
const ORIGIN = process.env.ALLOW_ORIGIN || 'https://appassets.androidplatform.net';
const cache = new Map(); // attemptId -> yanıt (aynı cevap iki kez puanlanmasın/ücretlendirilmesin)
const TTL = 24 * 3600e3;
const ERR = { None: null, Omission: 'omission', Insertion: 'insertion', Mispronunciation: 'mispronunciation' };
function num(v) { return typeof v === 'number' && isFinite(v) ? v : undefined; }
async function assess(body) {
  const ref = String(body.referenceText || '').slice(0, 200);
  const cfg = { ReferenceText: ref, GradingSystem: 'HundredMark', Granularity: 'Phoneme', Dimension: 'Comprehensive', EnableMiscue: true };
  const url = `https://${REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=zh-CN&format=detailed`;
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': KEY,
      'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
      'Accept': 'application/json',
      'Pronunciation-Assessment': Buffer.from(JSON.stringify(cfg)).toString('base64')
    },
    body: Buffer.from(body.audio, 'base64')
  });
  if (!r.ok) throw new Error('azure_http_' + r.status);
  const j = await r.json();
  if (j.RecognitionStatus !== 'Success') return { ok: true, valid: false, reason: String(j.RecognitionStatus || 'no_speech') };
  const nb = (j.NBest || [])[0] || {};
  const pa = nb.PronunciationAssessment || {};
  const overall = num(pa.PronScore);
  if (overall === undefined) throw new Error('no_pron_score');
  const sub = {};
  if (num(pa.AccuracyScore) !== undefined) sub.accuracy = pa.AccuracyScore;
  if (num(pa.FluencyScore) !== undefined) sub.fluency = pa.FluencyScore;
  if (num(pa.CompletenessScore) !== undefined) sub.completeness = pa.CompletenessScore;
  // Ton ve prosodi: Azure yanıtında bu ölçüler açıkça yoksa GÖNDERİLMEZ (uydurulmaz).
  if (num(pa.ProsodyScore) !== undefined) sub.prosody = pa.ProsodyScore;
  const units = (nb.Words || []).map(w => ({
    text: w.Word,
    score: num(w.PronunciationAssessment && w.PronunciationAssessment.AccuracyScore),
    issue: ERR[(w.PronunciationAssessment || {}).ErrorType] || null
  }));
  return { ok: true, valid: true, engine: ENGINE, model: MODEL, scoringVersion: VERSION, overall, sub, units, recognizedText: nb.Display || nb.Lexical || '' };
}
function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-App-Token');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Vary', 'Origin');
}
http.createServer((req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  if (req.method !== 'POST' || req.url !== '/assess') { res.writeHead(404); return res.end(); }
  if (TOKEN && req.headers['x-app-token'] !== TOKEN) { res.writeHead(401); return res.end('{"ok":false}'); }
  const chunks = []; let size = 0;
  req.on('data', c => { size += c.length; if (size > 3e6) { res.writeHead(413); res.end(); req.destroy(); } else chunks.push(c); });
  req.on('end', async () => {
    let body; try { body = JSON.parse(Buffer.concat(chunks).toString()); } catch (e) { res.writeHead(400); return res.end('{"ok":false}'); }
    const id = String(body.attemptId || ''); if (!id || !body.audio) { res.writeHead(400); return res.end('{"ok":false}'); }
    const hit = cache.get(id);
    if (hit && Date.now() - hit.t < TTL) { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify(hit.v)); }
    try {
      const out = await assess(body);
      cache.set(id, { t: Date.now(), v: out });
      res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(out));
    } catch (e) { // hata → puan değil; istemci "bekliyor" olarak işaretler
      res.writeHead(502, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: false, error: String(e.message || e) }));
    }
  });
}).listen(process.env.PORT || 8787, () => console.log('assess server listening'));
setInterval(() => { const n = Date.now(); for (const [k, v] of cache) if (n - v.t > TTL) cache.delete(k); }, 3600e3);
