This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
<<<<<<< HEAD

# VetApp Notification System

Bu proje, veteriner randevu uygulaması için bildirim sistemi içerir.

## OneSignal Kurulumu

### 1. OneSignal Hesabı Oluşturma
1. [OneSignal.com](https://onesignal.com) adresine gidin
2. Ücretsiz hesap oluşturun
3. Giriş yapın

### 2. Yeni Uygulama Oluşturma
1. Dashboard'da "New App" butonuna tıklayın
2. Uygulama adını girin (örn: "VetApp")
3. Platform seçin: **React Native**
4. "Create App" butonuna tıklayın

### 3. OneSignal App ID Alma
1. Oluşturulan uygulamaya tıklayın
2. Sol menüden **"Settings"** > **"Keys & IDs"** seçin
3. **"OneSignal App ID"** değerini kopyalayın
4. Bu değeri `src/services/oneSignalService.ts` dosyasındaki `ONESIGNAL_APP_ID` değişkenine yapıştırın

### 4. REST API Key Alma
1. Aynı **"Keys & IDs"** sayfasında
2. **"REST API Key"** değerini kopyalayın
3. Bu değeri `src/services/oneSignalService.ts` dosyasındaki `YOUR_REST_API_KEY` değişkenine yapıştırın

### 5. Kod Güncelleme
```typescript
// src/services/oneSignalService.ts dosyasında:
const ONESIGNAL_APP_ID = 'YOUR_ACTUAL_ONESIGNAL_APP_ID_HERE';
const YOUR_REST_API_KEY = 'YOUR_ACTUAL_REST_API_KEY_HERE';
```

### 6. Firebase Console'da OneSignal Player ID'leri Saklama
OneSignal Player ID'leri Firestore'da `oneSignalPlayers` koleksiyonunda saklanacak:
```
oneSignalPlayers/{userId}
  - playerId: string
  - userId: string
  - createdAt: timestamp
```

## Test Etme

1. Uygulamayı başlatın
2. Veteriner hesabıyla giriş yapın
3. Ana ekranda "🔔 OneSignal Test Ekranı" butonuna tıklayın
4. Test ekranında:
   - "🚀 OneSignal Başlat" - OneSignal'ı başlatır
   - "🔍 Player ID Al" - Cihazın Player ID'sini alır
   - "💾 Player ID Kaydet" - Player ID'yi Firestore'a kaydeder
   - "🧪 Kendine Test Bildirimi" - Kendinize test bildirimi gönderir
   - "📅 Randevu Test Bildirimi" - Randevu bildirimi test eder

## Randevu Bildirimleri

Yeni bir randevu oluşturulduğunda:
1. Veterinerin OneSignal Player ID'si Firestore'dan alınır
2. OneSignal REST API kullanılarak bildirim gönderilir
3. Bildirim içeriği: "Yeni randevu talebi: {petName} - {date}"

## Sorun Giderme

### Bildirim Gelmiyor
1. OneSignal App ID ve REST API Key'in doğru olduğundan emin olun
2. Cihazın internet bağlantısını kontrol edin
3. OneSignal Test Ekranından Player ID'nin kaydedildiğini kontrol edin

### Player ID Alınamıyor
1. OneSignal SDK'nın doğru başlatıldığından emin olun
2. Bildirim izinlerinin verildiğini kontrol edin
3. Cihazın OneSignal'a kayıtlı olduğunu doğrulayın

## Geliştirme Notları

- OneSignal SDK API'si sürekli güncellenmektedir
- Mevcut implementasyon basitleştirilmiş test amaçlıdır
- Production kullanımı için daha kapsamlı hata yönetimi gerekebilir
=======
>>>>>>> 7ee836d (google sign in bir daha bozulana kadar düzeldi.)
