# 🚀 Panduan Deployment ke Vercel dengan Database Neon

## 📋 Prasyarat

- Akun GitHub dengan repository `safir2310/Perhitungan-RH`
- Akun Vercel (gratis di https://vercel.com)
- Akun Neon (gratis di https://neon.tech)

---

## 🗄️ Step 1: Setup Database Neon (PostgreSQL)

### 1.1 Buat Akun Neon

1. Buka https://neon.tech
2. Sign up dengan GitHub (disarankan)
3. Klik **"Create a project"**

### 1.2 Buat Database Baru

1. Isi form:
   - **Project name**: `perhitungan-rh-db` (atau nama lain)
   - **Region**: Pilih yang terdekat (misal: Singapore)
   - **PostgreSQL version**: 16 (default)
2. Klik **"Create project"**
3. Tunggu beberapa detik hingga database dibuat

### 2.2 Get Connection String

Setelah project dibuat:
1. Dashboard akan menampilkan connection string
2. Copy **Connection String** yang berbentuk:
   ```
   postgresql://neondb_owner:npg_XXX@ep-XXX-XXX-XXX.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
3. **Simpan connection string ini** untuk langkah selanjutnya

**⚠️ Penting**: Project ini sudah dikonfigurasi dengan database Neon. Connection string yang sudah di-setup:
- Database: `neondb`
- Host: `ep-wild-field-aidxb4qi-pooler.c-4.us-east-1.aws.neon.tech`
- User: `neondb_owner`

**🔐 Security**: Setelah deployment selesai, disarankan untuk rotate password di Neon dashboard.

---

## 🔧 Step 2: Update Environment Variables untuk Local Development

Buat atau update file `.env` di root project:

```env
# Database URL dari Neon
DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"

# Cron secret untuk auto-check
CRON_SECRET="your-secret-key-here"

# Check interval (opsional, default: setiap jam)
CHECK_INTERVAL="0 * * * *"
```

**Ganti placeholder** dengan connection string yang Anda copy dari Neon.

---

## 📦 Step 3: Generate Prisma Client & Push Schema

Jalankan perintah berikut di terminal:

```bash
# Generate Prisma client untuk PostgreSQL
bun run db:generate

# Push schema ke database Neon
bun run db:push
```

Konfirmasi dengan mengetik `yes` jika diminta.

---

## 🚀 Step 4: Deploy ke Vercel

### 4.1 Connect GitHub ke Vercel

1. Login ke https://vercel.com
2. Klik **"Add New..."** → **"Project"**
3. Klik **"Import Git Repository"**
4. Cari dan pilih repository: `safir2310/Perhitungan-RH`
5. Klik **"Import"**

### 4.2 Configure Project

Di halaman **Configure Project**:

#### Framework Preset
- **Framework Preset**: Next.js
- **Root Directory**: `./`
- **Build Command**: `bun run build`
- **Output Directory**: `.next/standalone`
- **Install Command**: `bun install`

#### Environment Variables

Tambahkan environment variables berikut:

1. Klik **"Environment Variables"**
2. Tambahkan variabel:

| Name | Value | Description |
|------|-------|-------------|
| `DATABASE_URL` | Connection string dari Neon (Step 1.3) | Database connection |
| `CRON_SECRET` | `rahasia-unik-anda` | Secret untuk cron job |
| `CHECK_INTERVAL` | `0 * * * *` | Interval auto-check (optional) |

**PENTING**: Pastikan `DATABASE_URL` sesuai dengan yang Anda dapatkan dari Neon!

3. Klik **"Add"** untuk setiap variabel

### 4.3 Deploy

1. Scroll ke bawah
2. Klik **"Deploy"**
3. Tunggu proses deploy selesai (biasanya 1-2 menit)

---

## ✅ Step 5: Verifikasi Deployment

Setelah deploy selesai:

### 5.1 Cek Website

1. Vercel akan memberikan URL seperti: `https://perhitungan-rh-xxx.vercel.app`
2. Buka URL tersebut
3. Coba:
   - Register akun baru
   - Login
   - Tambah produk
   - Cek dashboard

### 5.2 Cek Database

1. Buka Dashboard Neon
2. Klik pada project database
3. Klik **"SQL Editor"**
4. Jalankan query untuk cek data:

```sql
-- Cek users
SELECT * FROM "User";

-- Cek products
SELECT * FROM "Product";

-- Cek notification logs
SELECT * FROM "NotificationLog";
```

---

## 🔁 Step 6: Setup Re-deployment Otomatis

Setiap kali Anda push code ke GitHub, Vercel akan otomatis redeploy.

### Push Changes ke GitHub:

```bash
# Add semua perubahan
git add .

# Commit
git commit -m "Update database to PostgreSQL for Vercel deployment"

# Push ke GitHub
git push origin main
```

Vercel akan otomatis mendeteksi dan redeploy!

---

## 🛠️ Step 7: Managing Production Database

### Run Prisma Migrations di Production

Jika Anda mengubah schema di masa depan:

```bash
# Di local development
bun run db:push

# Push ke GitHub
git push origin main

# Vercel akan otomatis redeploy dengan schema baru
```

### Akses Database Production

1. Dashboard Neon → Project Anda
2. Klik **"Tables"** untuk melihat data
3. Klik **"SQL Editor"** untuk menjalankan query
4. Klik **"Console"** untuk melihat logs

### Reset Database (WARNING: Hapus semua data!)

```sql
-- Di SQL Editor Neon
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

Lalu jalankan `bun run db:push` untuk membuat ulang tabel.

---

## 📊 Step 8: Monitor Logs di Vercel

### View Logs

1. Dashboard Vercel → Project Anda
2. Klik **"Logs"** tab
3. Pilih:
   - **Production** - Live logs dari production
   - **Preview** - Logs dari preview deployments
   - **Build** - Build logs

### Common Issues

**Error: Connection timeout**
- Cek DATABASE_URL di Environment Variables
- Pastikan database Neon masih aktif

**Error: Prisma Client not generated**
- Add script `postinstall` di package.json:
  ```json
  "scripts": {
    "postinstall": "prisma generate"
  }
  ```

---

## 🔐 Step 9: Security Best Practices

### 1. Protect Environment Variables

- Jangan commit `.env` file ke GitHub
- Sudah ada di `.gitignore`
- Gunakan Vercel Environment Variables untuk production

### 2. Database Connection Pooling

Untuk high-traffic, gunakan connection pooling:

```env
DATABASE_URL="postgres://[user]:[password]@[host]/[database]?pgbouncer=true&sslmode=require"
```

### 3. Enable Row Level Security (RLS) di Neon (Optional)

Untuk keamanan tambahan, bisa setup RLS di PostgreSQL.

---

## 📱 Step 10: Custom Domain (Optional)

### Add Custom Domain

1. Dashboard Vercel → Project → **Settings** → **Domains**
2. Klik **"Add Domain"**
3. Masukkan domain Anda (misal: `rh.safir2310.com`)
4. Follow instruksi untuk update DNS records

---

## 🎯 Summary Checklist

Sebelum deployment, pastikan:

- [ ] Database Neon sudah dibuat
- [ ] `prisma/schema.prisma` sudah update ke PostgreSQL
- [ ] `.env` file sudah ada dengan DATABASE_URL yang benar
- [ ] `bun run db:push` sudah berhasil dijalankan
- [ ] Project sudah connected ke Vercel
- [ ] Environment variables sudah di-set di Vercel
- [ ] Build command sudah benar
- [ ] Deploy berhasil tanpa error
- [ ] Website bisa diakses dan berfungsi
- [ ] Register & Login berfungsi
- [ ] CRUD produk berfungsi
- [ ] Notifikasi berfungsi

---

## 🐛 Troubleshooting

### Error: "No such file or directory, scandb 'db'"

**Solusi**: Hapus folder `db/` karena sudah menggunakan PostgreSQL (cloud database)

```bash
rm -rf db/
```

### Error: "P3005"

**Solusi**: Database sudah ada dengan schema berbeda, jalankan:

```bash
bun run db:push --accept-data-loss
```

### Build Failed di Vercel

**Cek**:
1. Build logs di Vercel
2. Environment variables sudah benar?
3. Dependencies sudah terinstall?

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## 🎉 Selesai!

Sistem RH Kadaluarsa Anda sekarang sudah di-deploy ke Vercel dengan database Neon PostgreSQL yang scalable dan reliable!

**URL Production**: `https://perhitungan-rh-[xxx].vercel.app`
**Database**: Neon PostgreSQL
**Auto-deploy**: Aktif (setiap push ke GitHub)

Selamat! 🚀
