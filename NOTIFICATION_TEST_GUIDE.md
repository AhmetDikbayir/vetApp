# 🔔 Bildirim Test Rehberi

Bu rehber, VetApp uygulamasında bildirim sistemini test etmek için hazırlanmıştır.

## 📋 Yapılan Değişiklikler

### 1. Notification Service Güncellemeleri
- ✅ Detaylı hata takibi ve alert'ler eklendi
- ✅ Backend API desteği eklendi (Firebase Functions)
- ✅ FCM token yönetimi iyileştirildi
- ✅ Emülatör desteği geliştirildi

### 2. Firebase Functions
- ✅ `/send-notification` endpoint'i eklendi
- ✅ `/test-notification` endpoint'i eklendi
- ✅ CORS desteği eklendi
- ✅ Hata yönetimi iyileştirildi

### 3. Test Ekranı
- ✅ `NotificationTestScreen` oluşturuldu
- ✅ Detaylı log sistemi eklendi
- ✅ Hem Firebase direkt hem Backend API testleri
- ✅ FCM token yönetimi testleri

## 🚀 Test Adımları

### Adım 1: Uygulamayı Başlatın
```bash
npx react-native run-android
# veya
npx react-native run-ios
```

### Adım 2: Test Ekranına Erişin
1. Uygulamaya giriş yapın
2. Ana ekranda "🧪 Bildirim Test Ekranı" butonuna tıklayın
3. Test ekranı açılacak

### Adım 3: FCM Token Testleri
1. **🔍 FCM Token Al**: Cihazınızın FCM token'ını alır
2. **💾 FCM Token Kaydet**: Token'ı Firestore'a kaydeder
3. **🔔 Bildirim İzni İste**: Bildirim izinlerini kontrol eder

### Adım 4: Bildirim Testleri
1. **🚀 Firebase Direkt Test**: Uygulama içinden direkt FCM kullanır
2. **🌐 Backend API Test**: Firebase Functions üzerinden gönderir (Blaze planı gerektirir)

## 🔧 Firebase Functions Deploy (Opsiyonel)

Firebase Functions'ı kullanmak için:

1. **Blaze Planına Geçin**:
   - [Firebase Console](https://console.firebase.google.com/project/vetapp-c8037/usage/details)
   - "Upgrade to Blaze" butonuna tıklayın

2. **Functions'ı Deploy Edin**:
   ```bash
   firebase deploy --only functions
   ```

3. **URL'yi Güncelleyin**:
   ```typescript
   // src/services/notificationService.ts
   static backendUrl = 'https://us-central1-vetapp-c8037.cloudfunctions.net';
   ```

## 📱 Test Senaryoları

### Senaryo 1: Emülatörde Test
- ✅ FCM token alınır (geçici token)
- ✅ Bildirim izni otomatik verilir
- ✅ Firebase direkt test çalışır
- ❌ Backend API test çalışmaz (localhost)

### Senaryo 2: Gerçek Cihazda Test
- ✅ FCM token alınır (gerçek token)
- ✅ Bildirim izni kullanıcıdan istenir
- ✅ Firebase direkt test çalışır
- ✅ Backend API test çalışır (deploy edilirse)

### Senaryo 3: Veteriner Bildirimi Test
1. Veteriner hesabıyla giriş yapın
2. Test ekranında bildirim gönderin
3. Bildirim alıp almadığınızı kontrol edin

## 🐛 Sorun Giderme

### Bildirim Gelmiyor
1. **FCM Token Kontrolü**: Token alınıp alınmadığını kontrol edin
2. **İzin Kontrolü**: Bildirim izinlerinin verildiğini kontrol edin
3. **Cihaz Kontrolü**: Gerçek cihazda test edin (emülatörde sınırlı)
4. **Firebase Console**: Firebase Console'da bildirimleri kontrol edin

### Backend API Hatası
1. **Blaze Planı**: Firebase Blaze planına geçin
2. **Functions Deploy**: Functions'ı deploy edin
3. **URL Kontrolü**: Backend URL'nin doğru olduğunu kontrol edin
4. **CORS**: CORS ayarlarını kontrol edin

### FCM Token Hatası
1. **Google Services**: google-services.json dosyasını kontrol edin
2. **Firebase Config**: Firebase konfigürasyonunu kontrol edin
3. **Network**: İnternet bağlantısını kontrol edin

## 📊 Log Takibi

Test ekranında:
- ✅ Başarılı işlemler yeşil ile gösterilir
- ❌ Hatalar kırmızı ile gösterilir
- ⏳ İşlemler devam ederken loading gösterilir
- 📋 Son 10 işlem logu tutulur

## 🔄 Güncellemeler

### v1.0.0 (Mevcut)
- ✅ Temel bildirim sistemi
- ✅ FCM token yönetimi
- ✅ Test ekranı
- ✅ Detaylı loglar

### v1.1.0 (Planlanan)
- 🔄 Firebase Functions deploy
- 🔄 Backend API entegrasyonu
- 🔄 Push notification handling
- 🔄 Background notification support

## 📞 Destek

Sorun yaşarsanız:
1. Console loglarını kontrol edin
2. Test ekranındaki logları kontrol edin
3. Firebase Console'u kontrol edin
4. Gerçek cihazda test edin

---

**Not**: Emülatörde bildirimler sınırlı çalışır. Gerçek cihazda test etmeniz önerilir. 