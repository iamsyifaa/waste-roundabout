# ♻️ Waste-Roundabout Backend API (Agri-Cycle)

REST API untuk platform **Agri-Cycle** — marketplace limbah pertanian yang menghubungkan Petani (Farmer) dengan Pengepul (Collector). Petani memposting limbah, Pengepul membeli secara online via **Midtrans**, dan Petani mendapatkan poin reward serta **Badge Gamifikasi**.

## 🛠 Tech Stack

Node.js · TypeScript · Express.js · Prisma ORM · PostgreSQL (Neon) · JWT · bcrypt · Zod · Helmet · Midtrans SDK · Google Generative AI (Gemini) · Jest & Supertest

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
npx prisma db push

# 5. Seed data kategori limbah & badge
npx prisma db seed

# 6. Jalankan server
npm run dev
```

Server berjalan di `http://localhost:3000`

### Environment Variables

Buat file `.env` di folder `backend/`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
JWT_SECRET="ganti_dengan_secret_yang_kuat"
PORT=3000
FRONTEND_URL="http://localhost:5173"

# Midtrans API Keys (Wajib untuk fitur pembayaran)
MIDTRANS_SERVER_KEY="Mid-server-..."
MIDTRANS_CLIENT_KEY="Mid-client-..."

# Gemini AI API Key (Wajib untuk fitur klasifikasi limbah)
GEMINI_API_KEY="your_gemini_api_key_here"
```

---

## 📂 Struktur Proyek

```
backend/src/
├── controllers/         # Request handler
├── middlewares/         # Middleware (Auth, Error Handler, Security)
├── routes/              # Route definitions (/api/v1/*)
├── services/            # Core business logic (SOA Pattern)
├── tests/               # Unit & Integration Tests (Jest)
├── utils/               # Helper (Prisma, Zod, Midtrans, Gemini)
├── app.ts               # Express config & middleware setup
└── index.ts             # Entry point server
```

---

## 🗄 Database

### Models

| Model | Deskripsi |
| :--- | :--- |
| **User** | Pengguna (role: FARMER / COLLECTOR / ADMIN) dengan sistem poin |
| **WasteCategory** | Kategori limbah beserta `basePricePerKg` |
| **WastePost** | Postingan limbah (status: AVAILABLE → BOOKED → SOLD) |
| **Transaction** | Transaksi jual-beli (Terintegrasi dengan Midtrans PaymentStatus) |
| **PointLog** | Riwayat penambahan poin Farmer |
| **Badge & UserBadge** | Sistem Achievement/Medali untuk Gamifikasi |

### Useful Commands

```bash
npx prisma studio        # Buka GUI database
npx prisma db push       # Sync skema tanpa migrasi file
npx prisma db seed       # Seed data awal (Kategori & Badge)
npm run test             # Jalankan test suite
```

---

## 📡 API Endpoints Utama

Base URL: `http://localhost:3000/api/v1`

### Authentication & Users
| Method | Endpoint | Auth | Deskripsi |
| :--- | :--- | :---: | :--- |
| `POST` | `/auth/register` | Tidak | Registrasi (`FARMER` / `COLLECTOR`) |
| `POST` | `/auth/login` | Tidak | Login & dapatkan JWT token |
| `GET`  | `/users/me` | Ya | Lihat profil, poin, dan badge |
| `GET`  | `/users/leaderboard` | Tidak | Top Farmer berdasarkan poin terbanyak |

### Gemini AI
| Method | Endpoint | Auth | Deskripsi |
| :--- | :--- | :---: | :--- |
| `POST` | `/ai/classify` | Ya (FARMER) | Analisis deskripsi limbah & rekomendasi |

### Waste & Transactions
| Method | Endpoint | Auth | Deskripsi |
| :--- | :--- | :---: | :--- |
| `POST` | `/waste` | Ya (FARMER) | Posting limbah baru |
| `GET`  | `/waste` | Tidak | List semua limbah (Mendukung Pagination & Sorting) |
| `POST` | `/transactions` | Ya (COLLECTOR)| Booking limbah yang tersedia |
| `PATCH`| `/transactions/:id/complete`| Keduanya | Selesaikan transaksi (Memicu pembagian Poin & Badge) |

### Midtrans Payments
| Method | Endpoint | Auth | Deskripsi |
| :--- | :--- | :---: | :--- |
| `POST` | `/payments/:transactionId/pay` | Ya (COLLECTOR)| Generate Snap Token pembayaran |
| `POST` | `/payments/notification` | Tidak | Webhook callback dari Midtrans |

---

## 🎬 Alur Penggunaan

```
1. Farmer cek deskripsi limbah via AI  → POST /ai/classify
2. Farmer posting limbah               → POST /waste
3. Collector booking limbah            → POST /transactions
4. Collector melakukan pembayaran      → POST /payments/:id/pay (Muncul Popup Midtrans)
5. Midtrans kirim notifikasi lunas     → POST /payments/notification
6. Transaksi diselesaikan              → PATCH /transactions/:id/complete
7. Farmer otomatis dapat Poin & Badge! 🎉
```

---

## 🏆 Fitur: Advanced Gamification

Platform ini menggunakan sistem poin **dinamis** dan **Badge Achievement** untuk memotivasi Farmer:

- **Poin Dinamis:** Poin dihitung otomatis berdasarkan berat limbah (contoh: 100kg limbah bisa menghasilkan poin jauh lebih besar dibanding 10kg, minimal poin adalah 10).
- **Point Log:** Riwayat penambahan poin bisa dilacak secara transparan.
- **Badge System:** Farmer bisa *unlock* medali spesial:
  - `FIRST_SALE` 🥚: Sukses jualan pertama kali.
  - `ECO_WARRIOR` 🦸‍♂️: Sukses jualan 10x.
  - `CLUB_100KG` 💯: Menjual limbah akumulasi 100kg.
- **Leaderboard:** Dashboard publik untuk melihat Top Farmer!

---

## 🔒 Keamanan

- **Helmet** — Proteksi header HTTP
- **Rate Limiting** — Mencegah *brute-force* pada endpoint login
- **CORS** — Terkunci ke `FRONTEND_URL`
- **Zod** — Validasi *strict* untuk semua input API
- **bcrypt** — Hashing password
- **Role Guard Middleware** — Hanya Collector yang bisa beli, dsb.

---

## 🧪 Testing (Jest + Supertest)

Proyek ini telah dilengkapi dengan unit/integration tests untuk memastikan kelancaran alur sistem.

```bash
# Menjalankan seluruh test suite
npm run test
```
*Tersedia juga file `testing.http` untuk diuji manual menggunakan ekstensi REST Client di VS Code.*

---

## 🌐 Deployment

Siap untuk di-deploy ke **Vercel** atau platform NodeJS lainnya (sudah disetup `vercel.json` dan compile script). Pastikan semua Environment Variable di-set di Dashboard Vercel.

---

## 📄 License

ISC © 2026 **Tim Skibidi Stack**
