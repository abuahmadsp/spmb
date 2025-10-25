# Panduan Menjalankan Server Lokal dengan Laragon dan SQLite

## Persyaratan Sistem
- Laragon (sudah terinstal dan berjalan di sistem Anda)
- Node.js (sudah terinstal dan dapat diakses dari command line)
- npm (biasanya terinstal bersama Node.js)

## Langkah-langkah Instalasi dan Konfigurasi

### 1. Instalasi Dependensi
1. Buka terminal/command prompt di direktori proyek ini
2. Jalankan perintah berikut untuk menginstal semua dependensi:
   ```
   npm install
   ```

### 2. Konfigurasi Database
1. Database SQLite sudah disediakan dalam file `database.sqlite` di root direktori
2. Jika file tidak ada, sistem akan membuat database baru saat server dijalankan
3. File `.env` sudah dikonfigurasi untuk menggunakan SQLite

### 3. Menjalankan Server
Anda memiliki dua opsi untuk menjalankan server:

#### Opsi 1: Mode Development (disarankan saat pengembangan)
```
npm run dev
```

#### Opsi 2: Mode Production
```
npm start
```

### 4. Akses Aplikasi
1. Setelah server berjalan, aplikasi akan tersedia di: `http://localhost:3000`
2. API endpoint akan tersedia di: `http://localhost:3000/api/`

### 5. Verifikasi Instalasi
1. Pastikan tidak ada error di terminal/console
2. Buka browser dan kunjungi `http://localhost:3000/health` untuk mengecek status server
3. Jika responsnya JSON dengan status "OK", maka server berfungsi dengan baik

## Konfigurasi Laragon
Jika Anda menggunakan Laragon, Anda juga bisa:

1. Klik "Start" di Laragon untuk memulai semua layanan (Apache/Nginx, MySQL, dll.)
2. Namun untuk aplikasi ini kita hanya menggunakan bagian Node.js dari Laragon
3. Anda tetap bisa menjalankan server Node.js secara terpisah menggunakan perintah di atas

## Troubleshooting
Jika mengalami masalah:

1. Pastikan port 3000 tidak digunakan oleh aplikasi lain
2. Cek apakah file `database.sqlite` dapat diakses
3. Pastikan semua dependensi telah terinstal dengan benar
4. Periksa apakah Node.js dan npm terinstal dengan benar di sistem Anda

## Catatan
- Database SQLite akan menyimpan semua data di file `database.sqlite`
- File database ini aman untuk digunakan dalam lingkungan pengembangan maupun produksi kecil
- Data akan tetap tersimpan meskipun server dimatikan