# 📦 Sistem RH Kadaluarsa (Retur Harian)

Sistem manajemen **Retur Harian (RH)** untuk produk dengan aturan **H-14** sebelum tanggal kadaluarsa, lengkap dengan sistem autentikasi dan notifikasi WhatsApp otomatis.

## 🎯 Fitur Utama

### 🔐 Autentikasi
- **Login & Register** dengan validasi lengkap
- Validasi **Nomor WhatsApp** format Indonesia
- **Password Hashing** menggunakan SHA-256
- Session management yang aman

### 📊 Dashboard RH
- **Statistics Cards** real-time:
  - Total Produk
  - Produk Aman (Hijau)
  - Wajib Retur (Kuning)
  - Jatuh RH (Merah)
- **Tabel Produk** dengan filter berdasarkan status
- **Warning Alerts** untuk produk yang perlu perhatian

### 📦 Manajemen Produk
- **CRUD Produk** lengkap
- **Logika RH H-14** otomatis:
  - Tanggal RH = Tanggal Kadaluarsa - 14 hari (customizable)
  - Status otomatis berubah berdasarkan tanggal
- Form tambah/edit produk dengan validasi lengkap

### 📲 Notifikasi WhatsApp Otomatis
Notifikasi dikirim otomatis saat:
1. Produk baru ditambahkan dengan status "warning" atau "expired"
2. Status produk berubah menjadi "warning" atau "expired"
3. **Auto-check periodik** setiap jam

**Format Pesan WhatsApp:**

Untuk Produk Wajib Retur:
```
⚠️ NOTIFIKASI RH

Produk: [Nama Produk]
Jumlah: [Jumlah] item
Tanggal Kadaluarsa: [DD-MM-YYYY]
Tanggal RH: [DD-MM-YYYY]
Status: WAJIB RETUR (H-14)

Segera lakukan retur sebelum tanggal kadaluarsa.
```

Untuk Produk Jatuh RH:
```
🚨 PERINGATAN RH

Produk: [Nama Produk]
Jumlah: [Jumlah] item
Tanggal Kadaluarsa: [DD-MM-YYYY]
Status: JATUH RH (KADALUARSA)

Produk tidak boleh dijual. Segera lakukan penarikan dari rak.
```

### 🔔 Notifikasi Real-time
- **Socket.io Service** untuk notifikasi instan
- Toast notifications di dashboard
- Indikator koneksi real-time (Online/Offline)

## 🚀 Teknologi yang Digunakan

- **Framework**: Next.js 16 dengan App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (New York style)
- **Database**: Prisma ORM dengan SQLite
- **Real-time**: Socket.io
- **Cron Jobs**: node-cron

## 📁 Struktur Project

```
Perhitungan-RH/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # API Auth
│   │   │   ├── products/      # API Products
│   │   │   ├── notifications/ # API Notifications
│   │   │   └── auto-check/    # API Auto-check
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── auth/              # Komponen Auth
│   │   ├── dashboard/         # Komponen Dashboard
│   │   └── ui/                # shadcn/ui Components
│   ├── hooks/
│   │   ├── use-products.ts    # Hook Products
│   │   └── use-socket.ts      # Hook Socket.io
│   └── lib/
│       ├── auth.ts            # Helper Auth
│       ├── rh-helper.ts       # Helper RH Logic
│       ├── whatsapp.ts        # Helper WhatsApp
│       └── db.ts              # Prisma Client
├── mini-services/
│   ├── notification-service/  # Socket.io Service
│   └── cron-service/          # Cron Service
└── worklog.md                 # Documentation
```

## ⚙️ Instalasi & Setup

### 1. Clone Repository
```bash
git clone https://github.com/safir2310/Perhitungan-RH.git
cd Perhitungan-RH
```

### 2. Install Dependencies
```bash
bun install
```

### 3. Setup Database
```bash
bun run db:push
```

### 4. Setup Environment Variables
Buat file `.env`:
```env
DATABASE_URL="file:./db/custom.db"
CRON_SECRET="your-secret-key"
CHECK_INTERVAL="0 * * * *"  # Setiap jam
```

### 5. Jalankan Development Server
```bash
# Main application
bun run dev

# Notification service (port 3002)
cd mini-services/notification-service
bun run dev

# Cron service (background)
cd mini-services/cron-service
bun run dev
```

## 📱 Cara Penggunaan

1. **Daftar Akun**
   - Buka aplikasi
   - Klik "Daftar sekarang"
   - Isi username, nomor WhatsApp, dan password

2. **Login**
   - Masukkan username dan password
   - Klik "Masuk"

3. **Tambah Produk**
   - Klik "Tambah Produk"
   - Isi:
     - Nama Produk
     - Jumlah Item
     - Tanggal Kadaluarsa
     - Hari sebelum kadaluarsa untuk RH (default: 14)

4. **Monitor Dashboard**
   - Lihat statistik produk
   - Cek produk wajib retur dan jatuh RH
   - Filter berdasarkan status

5. **Kirim Notifikasi**
   - Klik "Cek Notifikasi" untuk memeriksa dan mengirim notifikasi
   - Notifikasi otomatis dikirim saat produk wajib retur

## 🎨 Indikator Status

| Status | Warna | Keterangan |
|--------|-------|------------|
| 🟢 Aman | Hijau | Produk aman, belum wajib retur |
| 🟡 Wajib Retur | Kuning | Sudah H-14, segera lakukan retur |
| 🔴 Jatuh RH | Merah | Produk kadaluarsa, tidak boleh dijual |

## 📝 Logika RH

```
Tanggal RH = Tanggal Kadaluarsa - Hari Sebelum RH (default 14)

Status Aman:    Hari Ini < Tanggal RH
Status Warning: Hari Ini ≥ Tanggal RH DAN Hari Ini < Tanggal Kadaluarsa
Status Expired: Hari Ini ≥ Tanggal Kadaluarsa
```

## 🔒 Keamanan

- Password di-hash dengan SHA-256
- Session cookies dengan httpOnly dan secure flags
- Secret verification untuk cron jobs
- Validasi input di frontend dan backend

## 📄 API Endpoints

### Auth
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/session` - Cek session

### Products
- `GET /api/products` - Get semua produk
- `POST /api/products` - Tambah produk baru
- `GET /api/products/[id]` - Get detail produk
- `PUT /api/products/[id]` - Update produk
- `DELETE /api/products/[id]` - Hapus produk
- `GET /api/products/statistics` - Get statistik

### Notifications
- `POST /api/notifications/check` - Cek dan kirim notifikasi
- `POST /api/notifications/send` - Kirim notifikasi manual
- `GET /api/notifications/logs` - Get log notifikasi

### Auto-check
- `POST /api/auto-check` - Jalankan auto-check (dengan secret)
- `GET /api/auto-check?secret=...` - Cek status auto-check

## 🚀 Deployment

### Vercel (Recommended for Next.js)
1. Connect repository ke Vercel
2. Setup environment variables
3. Deploy

### Alternatif
- Render
- Railway
- Self-hosted VPS

## 🤝 Kontribusi

Contributions are welcome! Silakan:
1. Fork repository
2. Buat branch baru
3. Commit changes
4. Push ke branch
5. Buat Pull Request

## 📄 License

MIT License - silakan gunakan untuk keperluan apapun.

## 👥 Authors

- **Safir** - *Initial work* - [safir2310](https://github.com/safir2310)

## 🙏 Acknowledgments

- Next.js team
- shadcn/ui components
- Prisma team
- Socket.io team

---

**Dibuat dengan ❤️ untuk mempermudah manajemen retur harian produk**
