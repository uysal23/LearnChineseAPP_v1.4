package com.liuxi.cince;

/** Yerleşik motor yok: uygulama sunucu seçeneğine ya da "puan bekliyor" durumuna düşer. */
public class NoEngine implements PronEngine {
    @Override
    public boolean isReady() {
        return false;
    }

    @Override
    public String assess(String referenceText, byte[] wav16kMono) {
        return "{\"ok\":false,\"error\":\"no_engine\"}";
    }
}
