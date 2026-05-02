const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Hubungkan ke Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Ambil Data Sampah
app.get('/api/waste', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM waste_items');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Backend Ready di Port 3000'));

// Endpoint untuk tambah sampah baru
app.post('/api/waste', async (req, res) => {
  const { title, type, weight, price } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO waste_items (title, type, weight, price, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [title, type, weight, price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint untuk menghapus sampah berdasarkan ID
app.delete('/api/waste/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM waste_items WHERE id = $1', [id]);
    res.json({ message: "Data berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});