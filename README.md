# Restoran Yönetim Sistemi

React ve Bootstrap kullanılarak geliştirilmiş modern bir restoran yönetim web uygulaması. Bu sistem, restoran sahiplerine menülerini yönetmek, QR kodları oluşturmak ve idari görevleri yerine getirmek için kapsamlı bir çözüm sunar.

## 🌟 Özellikler

### Yönetici Paneli
- **QR Kod Oluşturucu**: Restoran menünüz için QR kodları oluşturun ve indirin
  - Restoran özel URL'leri ile özelleştirilebilir QR kodlar
  - Kolay indirme ve paylaşım seçenekleri
  - Menü URL'sini kopyalama özelliği
- **Menü Yönetimi**: 
  - Menü öğelerini ekleme, düzenleme ve silme
  - Öğeleri kategorilere ayırma
  - Fiyat ve açıklamaları belirleme
- **Kullanıcı Kimlik Doğrulama**:
  - Firebase Authentication ile güvenli giriş sistemi
  - Rol tabanlı erişim kontrolü
  - Kullanıcı profil yönetimi
- **Veri Yönetimi**:
  - Firebase Realtime Database ile gerçek zamanlı veri senkronizasyonu
  - Menü ve kullanıcı verilerinin güvenli depolanması
  - Otomatik yedekleme ve veri kurtarma

### Müşteri Özellikleri
- **Dijital Menü**:
  - QR kod ile erişilebilir
  - Tüm cihazlar için duyarlı tasarım
  - Kategori bazlı gezinme
  - Detaylı ürün açıklamaları ve fiyatlandırma
  - Firebase ile gerçek zamanlı menü güncellemeleri

## 🚀 Proje İlerlemesi

### Tamamlanan Özellikler
- ✅ Üretim URL desteği ile QR Kod Oluşturucu
- ✅ Yönetici paneli arayüzü
- ✅ Firebase Authentication ile güvenli giriş sistemi
- ✅ Firebase Realtime Database entegrasyonu
- ✅ Menü yönetim sistemi
- ✅ Duyarlı tasarım uygulaması

### Devam Eden Özellikler
- 🔄 Gelişmiş menü özelleştirme seçenekleri
- 🔄 Gerçek zamanlı sipariş yönetimi
- 🔄 Analiz paneli
- 🔄 Firebase Cloud Functions ile otomatik işlemler

## 🛠️ Teknik Altyapı

- **Ön Yüz**: React.js, React Bootstrap
- **Stil**: CSS, Bootstrap
- **QR Oluşturma**: qrcode.react
- **Backend**: Firebase
  - Authentication
  - Realtime Database
  - Hosting
  - Cloud Functions
- **Dağıtım**: Vercel

## 📦 Kurulum

1. Depoyu klonlayın:
```bash
git clone https://github.com/yourusername/restaurant-menagement.git
```

2. Bağımlılıkları yükleyin:
```bash
cd restaurant-menagement
npm install
```

3. Geliştirme sunucusunu başlatın:
```bash
npm start
```

## 🔗 Canlı Demo

Uygulama şu adreste erişilebilir durumda: [https://restaurant-menagement.vercel.app](https://restaurant-menagement.vercel.app)

## 📝 Kullanım Kılavuzu

### Restoran Sahipleri İçin
1. Yönetici paneline giriş yapın
2. QR Kod Oluşturucu bölümüne gidin
3. Restoranınızın QR kodunu oluşturun ve indirin
4. QR kodu masalara veya görüntüleme alanlarına yerleştirin
5. Menünüzü yönetici panelinden yönetin

### Müşteriler İçin
1. Masanızdaki QR kodu tarayın
2. Dijital menüyü görüntüleyin
3. Ürün detaylarını ve fiyatları inceleyin
4. Sipariş verin (yakında)

## 🤝 Katkıda Bulunma

Katkılarınız beklenmektedir! Lütfen çekinmeden Pull Request gönderin.

## 📄 Lisans

Bu proje MIT Lisansı altında lisanslanmıştır - detaylar için LICENSE dosyasına bakın.
