# Cihaz üzerinde Mandarin telaffuz değerlendirmesi — araştırma (Eylül 2026)

Ölçüt: (1) telefonda yerel/çevrimdışı çalışsın, (2) **Mandarin** desteklesin, (3) gerçek bir **telaffuz** puanı versin (ses tanıma metninin hedefe benzerliği değil).

| Aday | Yerel/telefon | Mandarin | Telaffuz puanı | Sonuç |
|---|---|---|---|---|
| **OpenPronounce** (Halleck45, MIT) | Hayır: Python 3.10+, PyTorch, ffmpeg, espeak-ng; iki Wav2Vec2 kontrol noktası (her biri ≈1,2 GB) ilk kullanımda indirilir; “kendi makinenizde, CPU’da” çalışır | **Hayır**: İngilizce kalibre; Fransızca, İspanyolca, Almanca, İtalyanca, Portekizce, Felemenkçe “deneysel”; Mandarin yok | Evet (fonem düzeyi, İngilizce) | Uygun değil (dil + platform) |
| **Google ML Kit** | Evet (API 31+) | Evet — ama yalnızca **konuşmadan metne**: GenAI Speech Recognition, temel modda `cmn-Hans-CN` (beta) | **Yok** (telaffuz değerlendirme API’si bulunmuyor) | Puan için uygun değil. Metin benzerliğinden puan üretmek ilkelerimize aykırı. İstenirse yalnızca “duyulan metin” (ses tanıma) için eklenebilir |
| **“Maise AI”** | — | — | — | Eşleşen bir ürün/kütüphane bulunamadı; bağlantı gerekli |

## Bulunan tek gerçekçi aday (doğrulanmamış)
**SpeechSuper Android SDK** (resmî GitHub deposu): İngilizce + Mandarin telaffuz değerlendirmesi; Çince kaynak dosyası `native_cn.res`; iOS demosunda `coreProvideType: "native"` parametresi var; üçüncü taraf listelemeleri “çevrimdışı SDK” diyor. Ancak: **ticari**, deneme anahtarı (e-posta ile) gerekir, `git lfs` ister, resmî sürüm/Maven paketi yok, çevrimdışı çalıştığı ve lisans/fiyat koşulları **resmî belgeden doğrulanmadı**. API’sini görmeden adaptör yazmak puan/davranış uydurmak olurdu; bu yüzden eklenmedi.

## Diğer yol (araştırma/mühendislik işi)
Açık bir Mandarin akustik modeliyle (ONNX Runtime Mobile) hece düzeyinde “Goodness of Pronunciation” hesabı. Gereken: uygun lisanslı model dosyaları (yüzlerce MB), ton etiketli hizalama, **insan puanlarıyla kalibrasyon ve doğrulama**. Doğrulanmadan “0–100 telaffuz puanı” diye sunulmamalı; “deneysel” etiketiyle sunulabilir.

## Uygulamada hazır olan
- `PronEngine` arayüzü + `AssessBridge` (`AndroidASSESS`) + JS sözleşmesi; test edildi (çevrimdışı puanlama, hata/geçersiz ses, motor kilidi, motor yokken sınavın başlamaması).
- Bir motor bulunduğunda yapılacak: `PronEngine` uygulanır, `MainActivity.engine` ona bağlanır; uygulamanın geri kalanı değişmez.

## Karar için gerekenler
1. SpeechSuper (ticari) denenecekse: deneme anahtarı + SDK dosyaları/dokümantasyonu (ya da bu sohbette GitHub/Maven erişimi), lisans koşullarınız.
2. “Maise AI” için bağlantı.
3. İstenirse ML Kit ile yalnızca ses tanıma (duyulan metin) eklenebilir; puan üretmez.
