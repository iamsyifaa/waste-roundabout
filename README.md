# ♻️ Waste-Roundabout Backend API

REST API untuk platform **Agri-Cycle** — marketplace limbah pertanian yang menghubungkan Petani (Farmer) dengan Pengepul (Collector). Petani posting limbah, Pengepul membeli, dan Petani mendapat poin reward.

## 🛠 Tech Stack

Node.js · TypeScript · Express.js · Prisma ORM · PostgreSQL (Neon) · JWT · bcrypt · Zod · Helmet

---

## 🚀 Instalasi & Setup

```bash
# 1. Clone repo
git clone https://github.com/<username>/waste-roundabout.git
cd waste-roundabout/backend

# 2. Install dependencies
npm install

# 3. Setup environment variables
# Buat file .env di folder backend/ (lihat contoh di bawah)

# 4. Jalankan migrasi database
npx prisma migrate dev

# 5. (Opsional) Seed data kategori limbah
npx prisma db seed

# 6. Jalankan server
npm run dev
```

Server berjalan di `http://localhost:3000`

### Environment Variables

Buat file `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
JWT_SECRET="ganti_dengan_secret_yang_kuat"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

---

## 📂 Struktur Proyek

```
backend/src/
├── controllers/         # Request handler (auth, waste, transaction)
├── middlewares/          # JWT auth middleware
├── routes/              # Route definitions (/api/v1/*)
├── utils/               # Prisma singleton & Zod schemas
├── app.ts               # Express config & middleware
└── index.ts             # Entry point
```

---

## 🗄 Database

### Models

| Model | Deskripsi |
| :--- | :--- |
| **User** | Pengguna (role: FARMER / COLLECTOR / ADMIN) dengan sistem poin |
| **WasteCategory** | Kategori limbah (Sekam Padi, Kulit Kopi, Jerami, dll) |
| **WastePost** | Postingan limbah oleh Farmer (status: AVAILABLE → BOOKED → SOLD) |
| **Transaction** | Transaksi jual-beli antara Farmer & Collector |
| **PointLog** | Log riwayat poin yang diterima Farmer |

### Useful Commands

```bash
npx prisma studio        # Buka GUI database
npx prisma migrate dev   # Jalankan migrasi
npx prisma db seed       # Seed data awal
```

---

## 📡 API Endpoints

Base URL: `http://localhost:3000/api/v1`

### Authentication

| Method | Endpoint | Auth | Deskripsi |
| :--- | :--- | :---: | :--- |
| `POST` | `/auth/register` | Tidak | Registrasi (role: `FARMER` / `COLLECTOR`) |
| `POST` | `/auth/login` | Tidak | Login, return JWT token (berlaku 1 jam) |

### Waste Posts

| Method | Endpoint | Auth | Deskripsi |
| :--- | :--- | :---: | :--- |
| `POST` | `/waste` | Ya (FARMER) | Posting limbah baru |
| `GET` | `/waste` | Tidak | List semua limbah yang tersedia |
| `GET` | `/waste/categories` | Tidak | List semua kategori limbah |

### Transactions

| Method | Endpoint | Auth | Deskripsi |
| :--- | :--- | :---: | :--- |
| `POST` | `/transactions` | Ya (COLLECTOR) | Beli/book limbah |
| `PATCH` | `/transactions/:id/complete` | Ya (COLLECTOR/FARMER terkait) | Selesaikan transaksi (+10 poin untuk Farmer) |

### Health Check

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/ping` | Return `pong` |

---

## 🎬 Alur Penggunaan

```
1. Farmer register & login         → dapat JWT token
2. Farmer posting limbah            → POST /waste
3. Collector register & login       → dapat JWT token
4. Collector lihat daftar limbah    → GET /waste
5. Collector beli limbah            → POST /transactions
6. Selesaikan transaksi             → PATCH /transactions/:id/complete
7. Farmer mendapat +10 poin! 🎉
```

---

## 💰 Fitur: Cuan Calculator

Harga jual limbah dihitung **otomatis** oleh sistem saat transaksi dibuat:

```
finalPrice = berat limbah (kg) × harga dasar per kg (dari kategori)
```

Setiap kategori limbah punya `basePricePerKg` yang bisa diatur di database (tabel `WasteCategory`). Collector tidak perlu input harga manual — sistem yang menentukan harga fair berdasarkan berat dan jenis limbah.

---

## 🏆 Fitur: Gamification (Sistem Poin)

Platform ini menggunakan sistem **poin reward** untuk memotivasi Farmer menjual limbah:

- Setiap transaksi yang berhasil diselesaikan (`COMPLETED`), Farmer otomatis mendapat **+10 poin**
- Poin terakumulasi di field `points` pada profil User
- Setiap penambahan poin dicatat di tabel `PointLog` sebagai riwayat

```
Transaksi selesai → Farmer +10 poin → Tercatat di PointLog
```

---

## 🔒 Keamanan

- **Helmet** — HTTP security headers
- **CORS** — Dibatasi ke `FRONTEND_URL`
- **Zod** — Validasi semua input request
- **bcrypt** — Password hashing (salt rounds: 10)
- **JWT** — Token-based auth (expiry: 1 jam)
- **Role Guard** — Endpoint dilindungi berdasarkan role
- **Authorization** — Transaksi hanya bisa diselesaikan oleh pihak terkait

---

## 📜 Scripts

| Script | Deskripsi |
| :--- | :--- |
| `npm run dev` | Server development (hot-reload) |
| `npm run build` | Compile TypeScript |
| `npm start` | Jalankan production build |
| `npm run prisma:studio` | Buka Prisma Studio GUI |
| `npm run prisma:migrate` | Jalankan migrasi database |

---

## 🌐 Deployment (Vercel)

```bash
npm i -g vercel
vercel --prod
```

Set environment variables di Vercel Dashboard: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`.

---

## 📄 License

ISC © 2026 **Tim Skibidi Stack**
