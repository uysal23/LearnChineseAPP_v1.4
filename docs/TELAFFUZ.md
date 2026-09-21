# Telaffuz: ses tanıma ve değerlendirme (sürüm 1.3)

## 1. İlkeler
- **Ses tanıma (ASR) ≠ telaffuz değerlendirmesi.** Sunucunun döndürdüğü *tanınan metin* arayüzde ayrı etiketle (“puan değildir”) gösterilir. Puan hiçbir zaman tanınan metin ile hedef metnin benzerliğinden **üretilmez**; genel puan yalnızca değerlendirme motorunun `overall` alanından gelir. `overall` yoksa/geçersizse kayıt “puan bekliyor” olur.
- Puan; konuşmacının ses rengine, cinsiyetine ya da örnek kayıtla aynı hızda konuşmasına göre **uygulama tarafında hesaplanmaz**.
- Alt ölçümler (ses/hece doğruluğu, ton, eksiksizlik, akıcılık, vurgu) yalnızca motor **gerçekten gönderdiyse** gösterilir; göndermediği ölçüm için “ölçülmüyor” yazılır, puan uydurulmaz.
- Örnek ses **yapay sestir** (cihazın Çince metin okuma motoru) ve arayüzde öyle etiketlenir. Ana dili Mandarin olan konuşmacı kaydı pakete dahil değildir.

## 2. Kullanıcı akışı (her sahne)
1. Hedef Çince metin (kelime/ifade ya da cümle) → 2. isteğe bağlı pinyin + Türkçe anlam → 3. örnek sesi dinle → 4. mikrofon düğmesiyle kayıt (kırmızı gösterge, süre, durdur) → 5. yerel kalite denetimi + analiz → 6. Türkçe geri bildirim → 7. “Örneği dinle / Kaydımı dinle / Tekrar dene / Favorilere ekle”.
Yeni oturumda 10 kelime + 10 cümle **karışık** sunulur. Her ekranda 🏠 ile dashboard’a dönülebilir.

## 3. Motor kapsamı
| Ölçüm | Uygulama | Referans sunucu (Azure) |
|---|---|---|
| Genel telaffuz (0–100) | zorunlu | `PronScore` |
| Ses/hece doğruluğu | varsa gösterir | `AccuracyScore` |
| Eksiksizlik | varsa gösterir | `CompletenessScore` |
| Akıcılık/duraklama | varsa gösterir | `FluencyScore` |
| Ton doğruluğu (nötr ton, bağlama bağlı değişim dahil) | varsa gösterir | **Gönderilmez** (Azure yanıtında ayrı ton puanı belgelenmemiş) |
| Vurgu/ritim | varsa gösterir | gönderilmez |
Hedef pinyinde 不/一 değişimi uygulanır; 3. ton değişimi (sandhi) uygulanmaz. Yorumu motor yapar.

## 4. Değerlendirme motoru: yerel (takılabilir) + isteğe bağlı sunucu
- **Cihaz üzerinde (çevrimdışı) motor: şu an pakete dahil değil.** Değerlendirilen üç seçenek (OpenPronounce, Google ML Kit, “Maise AI”) Mandarin telaffuz puanı için uygun bulunmadı; gerekçeler ve gerçekçi alternatifler `docs/YEREL_MOTOR.md` dosyasında.
- Uygulama motor-bağımsızdır: `AndroidASSESS` köprüsü (`PronEngine` arayüzü) bir yerel motor takıldığında **otomatik olarak yerel motoru kullanır**; ses cihazdan çıkmaz, onay penceresi çıkmaz, çevrimdışı çalışır. Sözleşme ve testler hazırdır.
- Yerel motor yokken puan yalnızca **isteğe bağlı bir değerlendirme sunucusundan** gelir (referans: `server/server.js`, Microsoft Azure Speech – Pronunciation Assessment). Lisans/ücret sunucuyu işleten kişiye ve sağlayıcıya aittir; **ilk gönderimden önce** sesin hangi sunucuya gideceği açıklanır ve onay alınır. API anahtarı **APK’da yoktur**.
- Hiçbir motor yoksa kayıt ve yerel dinleme çalışır; kayıtlar **“puan bekliyor”** işaretlenir; gerçek değerlendirme gelmeden sınav geçilmiş sayılmaz. Diğer içerikler çevrimdışı çalışır.

## 5. Sınav: 3 aşama
| Aşama | İçerik | Geçme |
|---|---|---|
| 1 | 100 kelime sorusu | ≥ 90 doğru |
| 2 | 120 cümle sorusu | ≥ 102 doğru |
| 3 | 20 sesli görev (10 kelime/ifade + 10 cümle) | 20 görevin aritmetik ortalaması ≥ 60 |
- Sonraki sahne ancak **üç aşama** da geçilince açılır (önceki sürümde tamamlanan sahneler korunur).
- Aşama 3: pinyin/Türkçe kapalı; örnek sesi dinlemek serbest; gönderimden önce kaydı dinleme/yeniden alma; geçerli gönderimden sonra cevap **sabitlenir**; ayrıntılı öneriler sınav sonunda.
- Karar **yuvarlanmamış** ortalamadan verilir (µ-puan tamsayı toplamı ≥ 60×20×10⁶). 59,95 ekranda “59,95” görünür ve başarısızdır.
- 20 görevin **tamamı** geçerli değerlendirilmeden sınav sonuçlanmaz. Sessizlik, bozuk kayıt, servis hatası, bağlantı kesintisi yanlış cevap sayılmaz (kayıt yeniden alınır veya “puan bekliyor” kalır).
- Aşama 3 başarısızsa Aşama 1–2 korunur; yalnızca Aşama 3 yeni denemeyle (görevler karıştırılarak) tekrarlanır.
- Bu %60 eşiği **uygulamanın ilerleme kuralıdır**; resmî/klinik bir telaffuz yeterlilik ölçütü değildir.

## 6. Kayıt ve devam etme
Kalıcı saklanan: deneme ve görev kimlikleri; görevlerin sabit sırası; gönderilen cevaplar ve puanlar; bekleyen analizlerin durumu; güncel görev; gönderilmemiş yerel kayıt; motor, model ve puanlama sürümü. Devam edince aynı görevden başlanır. Yarım kalmış mikrofon kaydı otomatik gönderilmez. Her deneme benzersiz `attemptId` taşır: aynı cevap iki kez puanlanmaz/istatistiğe eklenmez (istemcide ve sunucuda). Bir sınav denemesi içinde motor/model/sürüm değişirse yeni puan kabul edilmez (`engine_mismatch`).

## 7. Mikrofon, gizlilik, saklama
- Mikrofon izni ilk sesli çalışmada Türkçe gerekçeyle istenir; reddedilirse diğer bölümler çalışır, telaffuz için mikrofon gerektiği gösterilir.
- Kayıt yalnızca kullanıcı eylemiyle başlar; arka plana geçince/başka ekrana geçince kapanır; örnek ses çalarken kayıt başlamaz.
- Ham kayıtlar varsayılan olarak **kalıcı arşivlenmez**: uygulamaya özel depoda (IndexedDB) yalnızca devam eden sınav ve bekleyen analiz için tutulur, işi bitince silinir. Kullanıcı isterse tek tek “sakla”, Ayarlar’dan silebilir.

## 8. Veri modeli (`ST.pr`)
- **PronunciationTask**: `id, scene, kind('w'|'s'), text, py, tr`
- **VoiceAttempt** (`ST.pr.att[id]`): `id, taskId, scene, kind, text, ts, dur, status('recorded'|'pending'|'assessed'|'invalid'), err, audioId, examId, q{süre,zirve,sesli süre,SNR,kırpılma}`
- **PronunciationAssessment** (`ST.pr.asm[attemptId]`): `id, attemptId, engine, model, ver, overall, sub{accuracy,tone,completeness,fluency,prosody}, units[{text,score,issue}], recognized, ts`
- Sınav durumu (`ST.pr.ex[sahne]`): `id, tasks[], cur, ans{taskId→attemptId}, rec{}, engine, model, ver, done, res`

## 9. Sunucu sözleşmesi
`POST {sunucu}/assess` başlık `X-App-Token`; gövde `{attemptId, lang:'zh-CN', referenceText, kind, audioFormat:'wav-pcm16-16k', audio:<base64>}`.
Yanıt: `{ok:true, valid:true, engine, model, scoringVersion, overall, sub{…}, units[…], recognizedText}` · değerlendirilemeyen ses: `{ok:true, valid:false, reason}` · hata: HTTP ≠ 200 ya da `{ok:false}` (puan sayılmaz).

## 10. Bilinen sınırlar
- Yerel motor yok (bkz. §4). Referans sunucu canlı Azure hesabıyla **denenmedi**; yayına almadan önce güncel Azure REST belgeleriyle doğrulayın. Motorun sonuçları hatalı/yumuşak olabilir; puan resmî ölçüt değildir.
- Android WebView’de mikrofon akışı gerçek cihazda **denenmedi** (testler masaüstü Chromium’da sahte mikrofonla yapıldı).
- Yayın (claude.ai) sürümünde mikrofon, gömülü çerçeve izin politikasına bağlıdır; tam deneyim için APK önerilir.
- Sürüm 1.3 uygulama içeriğini `https://appassets.androidplatform.net` kökeninden sunar; önceki APK’lardaki yerel ilerleme bu yeni kökene taşınmaz.
