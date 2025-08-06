# OneSignal Kurulum Rehberi

## 1. OneSignal Dashboard'dan Bilgileri Alın

1. [OneSignal Dashboard](https://app.onesignal.com/)'a gidin
2. Uygulamanızı seçin veya yeni uygulama oluşturun
3. **Settings > Keys & IDs** bölümüne gidin
4. Aşağıdaki bilgileri not edin:
   - **OneSignal App ID**: `a59f68be-74d9-4bfd-8eb6-48b4b67777ae` (zaten ayarlanmış)
   - **REST API Key**: Bu bilgiyi alın

## 2. REST API Key'i Kodda Güncelleyin

`src/models/NotificationService.ts` dosyasında:

```typescript
private readonly REST_API_KEY = 'YOUR_REST_API_KEY'; // Buraya gerçek API key'i yazın
```

## 3. Event-Driven Bildirim Sistemi

### Klasör Yapısı:
```
src/
├── events/
│   ├── EventManager.ts          # Event yönetimi
│   └── NotificationEvents.ts    # Bildirim event'leri
├── models/
│   └── NotificationService.ts   # OneSignal entegrasyonu
└── services/
    └── appointmentService.ts    # Randevu servisi (event-driven)
```

### Nasıl Çalışır:

1. **Randevu Oluşturulduğunda:**
   - `appointmentService.createAppointment()` çağrılır
   - `APPOINTMENT_CREATED` event'i emit edilir
   - `NotificationService` bu event'i dinler
   - Veterinerin Player ID'si alınır
   - OneSignal REST API ile bildirim gönderilir
   - `NOTIFICATION_SENT` event'i emit edilir

2. **Bildirim Alındığında:**
   - OneSignal SDK bildirim alır
   - `NOTIFICATION_RECEIVED` event'i emit edilir

3. **Bildirim Tıklandığında:**
   - OneSignal SDK bildirim tıklamasını yakalar
   - `NOTIFICATION_CLICKED` event'i emit edilir

### Test Etmek İçin:

1. Uygulamayı başlatın
2. Veteriner olarak giriş yapın
3. "OneSignal Test Ekranı" butonuna tıklayın
4. Sırasıyla:
   - "OneSignal Başlat"
   - "Kullanıcı ID Set Et"
   - "Player ID Al"
   - "Player ID Kaydet"
   - "Test Randevusu Oluştur"

### Önemli Notlar:

- Veteriner kullanıcıların Player ID'leri `oneSignalPlayers` collection'ında saklanır
- Randevu oluşturulduğunda otomatik olarak veterinerin Player ID'si bulunur
- Bildirim gönderimi başarısız olursa event'ler ile takip edilir
- Tüm işlemler loglanır ve test ekranında görüntülenir

### Hata Ayıklama:

- Test ekranındaki logları kontrol edin
- OneSignal Dashboard'da "Audience" bölümünde Player ID'leri görün
- "Messages" bölümünde gönderilen bildirimleri kontrol edin
- REST API key'in doğru olduğundan emin olun 