require('dotenv').config();  // Memuat file .env
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');  // <-- Tambahkan ini

const authRoutes = require('./routes/authRoutes');
const goldRoutes = require('./routes/goldRoutes');  // Rute untuk transaksi emas
const jewelryRoutes = require('./routes/jewelryRoutes');  // Rute untuk transaksi perhiasan

const app = express();

// Aktifkan CORS untuk semua origin (atau bisa diatur spesifik)
app.use(cors()); // <-- Tambahkan ini

// Middleware untuk parsing JSON
app.use(bodyParser.json());

// Rute
app.use('/api/auth', authRoutes);
app.use('/api/gold', goldRoutes);
app.use('/api/perhiasan', jewelryRoutes);

// Middleware error handler (opsional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Jalankan server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
