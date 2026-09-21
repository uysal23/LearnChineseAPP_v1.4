# Kabul testi raporu (otomatik)

Sonuç: **60/60 geçti** — Chromium (Playwright), sahte mikrofon, sahte yerel motor ve sahte sunucu (yalnızca test amaçlı; puan motoru değildir).

| # | Test | Sonuç |
|---|---|---|
| 1 | Konuşma hızı ayarı yeniden yüklemeden sonra kalıcı | ✅ |
| 2 | Oynatma: seslendirilen metin ile altyazı aynı anda aynı cümle | ✅ |
| 3 | Oynatma: ses hızı = ayar (1,10) × konuşmacı katsayısı | ✅ |
| 4 | Mikrofon izni reddedilince açıklama gösterilir | ✅ |
| 5 | Mikrofon reddinden sonra diğer bölümler (kelime alıştırması) çalışır | ✅ |
| 6 | Reddedilen izin kayıt/deneme oluşturmaz | ✅ |
| 7 | Sessizlik: geçersiz kayıt, deneme kaydedilmez, istek gönderilmez | ✅ |
| 8 | Sessizlik: 0 puan · kaydedilmedi açıklaması | ✅ |
| 9 | Sessizlik istatistiğe/ortalamaya girmez | ✅ |
| 10 | Servis hatası: puan üretilmez, deneme “puan bekliyor” | ✅ |
| 11 | Servis hatası düşük puan sayılmaz (istatistik boş, bekleyen=1) | ✅ |
| 12 | Bağlantı gelince bekleyen kayıt bir kez değerlendirilir | ✅ |
| 13 | Yinelenen istek aynı cevabı iki kez puanlamaz/istatistiğe eklemez | ✅ |
| 14 | Tanınan metin hedefle aynı olsa da puan sağlayıcıdan (55) gelir | ✅ |
| 15 | Ses tanıma çıktısı “puan değildir” diye ayrı etiketlenir | ✅ |
| 16 | Desteklenmeyen alt ölçümler için puan uydurulmaz | ✅ |
| 17 | Telaffuz ortalaması soru başarı oranından ayrı | ✅ |
| 18 | Sınav: 19 geçerli görevle tamamlanmaz | ✅ |
| 19 | Sınav: tam 20 geçerli görevle tamamlanır | ✅ |
| 20 | İlk 2 aşama + aşama 3 geçilince sahne tamamlanır, sonraki açılır | ✅ |
| 21 | Ortalama 59.95 → başarısız (yuvarlamasız karar) | ✅ |
| 22 | Ortalama 60 → başarılı (yuvarlamasız karar) | ✅ |
| 23 | Ortalama 59.999999 → başarısız (yuvarlamasız karar) | ✅ |
| 24 | Ortalama 60.000001 → başarılı (yuvarlamasız karar) | ✅ |
| 25 | Aşama 1+2 geçilse de Aşama 3 geçilmeden sonraki sahne kilitli | ✅ |
| 26 | Aşama 3 başarısız: ilk iki aşama korunur, sahne kilitli kalır | ✅ |
| 27 | Yeniden deneme yalnızca Aşama 3: yeni deneme kimliği, görevler karıştırılmış, Aşama 1-2 dokunulmamış | ✅ |
| 28 | Aşama 1: 100 soru, 89/100 doğru → geçemez | ✅ |
| 29 | Aşama 1: 100 soru, 90/100 doğru → geçer | ✅ |
| 30 | Aşama 2: 120 soru, 101/120 doğru → geçemez | ✅ |
| 31 | Aşama 2: 120 soru, 102/120 doğru → geçer | ✅ |
| 32 | Bağlantı kesilince cevap sabit ama puan bekliyor; yanlış sayılmaz | ✅ |
| 33 | Gönderilmemiş kayıt yerelde saklı (inceleme aşamasında) | ✅ |
| 34 | Uygulama kapanınca yarım mikrofon kaydı sunucuya gönderilmez / saklanmaz | ✅ |
| 35 | Devam: aynı deneme, aynı sabit sıra, aynı görev (kayıtlı ama gönderilmemiş kayıt inceleme aşamasında) | ✅ |
| 36 | Bağlantı dönünce bekleyen sınav cevabı bir kez puanlanır | ✅ |
| 37 | Sınav denemesi içinde farklı motora sessizce geçilmez | ✅ |
| 38 | Arka plana geçince mikrofon kapanır (akış durur, yarım kayıt atılır) | ✅ |
| 39 | Dashboard’a dönünce mikrofon kapanır | ✅ |
| 40 | Örnek ses çalarken kayıt başlatılmaz | ✅ |
| 41 | Analiz sonrası ham kayıt sonuç ekranında dinlenebilir (cihazda) | ✅ |
| 42 | Sonuç ekranından çıkınca ham kayıt varsayılan olarak silinir; puan geçmişi korunur | ✅ |
| 43 | “Kaydı sakla” seçilen kayıt kalır | ✅ |
| 44 | Kullanıcı saklanan kaydı silebilir | ✅ |
| 45 | Sınav bitince sınav kayıtları silinir | ✅ |
| 46 | mediaDevices yoksa: neden ve ortam bilgisi gösterilir (genel mesaj değil) | ✅ |
| 47 | Mikrofon aygıtı yoksa açık açıklama + teknik ayrıntı gösterilir | ✅ |
| 48 | Kısıt hatasında sade ayarla ikinci deneme yapılır ve kayıt başarılı olur | ✅ |
| 49 | APK yerel kaydı: WebView getUserMedia kullanılmadan kayıt alınır | ✅ |
| 50 | APK yerel kaydı: gönderim ve puan akışı çalışır | ✅ |
| 51 | APK yerel kaydı: arka plana geçince yerel kayıt iptal edilir | ✅ |
| 52 | APK: Android izni reddedilirse açıklama gösterilir, uygulama çalışır | ✅ |
| 53 | APK: mikrofon başlatılamazsa neden + teknik kod gösterilir | ✅ |
| 54 | Yerel motor: çevrimdışı ve sunucusuz puan alınır, sunucuya istek/onay yok | ✅ |
| 55 | Yerel motor varken sesli sınav sunucu olmadan başlar | ✅ |
| 56 | Yerel motor: sınav cevabı sabitlenir, puan cihazda alınır | ✅ |
| 57 | Yerel motor hatası puan sayılmaz (“puan bekliyor”) | ✅ |
| 58 | Yerel motor “değerlendirilemedi” derse deneme kaydedilmez | ✅ |
| 59 | Motor yoksa (yerel kapalı, sunucu yok) sesli sınav başlamaz | ✅ |
| 60 | 115 sahnenin hepsinde 10+10 sesli görev, 100 kelime ve 120 cümle sorusu üretilir | ✅ |

## Otomatik test edilmeyenler (dürüst not)
- Android WebView/AudioRecord ile gerçek mikrofon izni ve kayıt (cihaz gerekir).
- Gerçek bir yerel telaffuz motoru (henüz yok) ve canlı Azure ile `server/server.js`.
- Gerçek konuşmacı sesleriyle puan kalitesi (motora bağlıdır).

Çalıştırma: `NODE_PATH=<playwright> node tests/pron.test.js`