const express = require('express');
const router = express.Router();
const jewelryController = require('../controllers/jewelryController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { authorizeRole } = require('../middlewares/authorizationMiddleware');

// 🔐 Admin: Tambah produk perhiasan (untuk dijual oleh sistem)
router.post('/produk', verifyToken, authorizeRole('admin'), jewelryController.createProduct);

// 📦 Get semua produk perhiasan
router.get('/produk', jewelryController.getAllProducts);

// 🧑‍💼 User: Menjual perhiasan ke sistem
router.post('/jual', verifyToken, jewelryController.buyJewelry); // ← ini adalah penjualan oleh user

// 📋 Admin: Lihat semua transaksi penjualan perhiasan
router.get('/transaksi', verifyToken, authorizeRole('admin'), jewelryController.getAllTransactions);

// ✅ Admin: Setujui transaksi penjualan
router.post('/approve', verifyToken, authorizeRole('admin'), jewelryController.approveTransaction);

// ❌ Admin: Tolak transaksi penjualan
router.post('/reject', verifyToken, authorizeRole('admin'), jewelryController.rejectTransaction);

module.exports = router;
