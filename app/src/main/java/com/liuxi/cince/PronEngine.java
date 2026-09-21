package com.liuxi.cince;

/**
 * Cihaz üzerinde (çevrimdışı) telaffuz değerlendirme motoru sözleşmesi.
 *
 * assess() 16 kHz mono PCM16 WAV baytlarını ve hedef metni alır, aşağıdaki JSON'u döndürür:
 *   Başarılı : {"ok":true,"valid":true,"engine":"...","model":"...","scoringVersion":"...",
 *               "overall":0-100,"sub":{"accuracy":..,"tone":..,"completeness":..,"fluency":..},
 *               "units":[{"text":"你","score":92,"issue":null}],"recognizedText":"..."}
 *   Ses değerlendirilemedi : {"ok":true,"valid":false,"reason":"no_speech"}
 *   Hata     : {"ok":false,"error":"..."}
 * Motorun ÖLÇMEDİĞİ alt ölçümler "sub" içine KONMAZ (uydurulmaz). "overall" motorun kendi
 * telaffuz puanıdır; tanınan metnin hedefe benzerliğinden türetilmemelidir.
 * assess() ayrı bir iş parçacığında çağrılır; uzun sürebilir.
 */
public interface PronEngine {
    boolean isReady();

    String assess(String referenceText, byte[] wav16kMono);
}
