const express = require('express');
const router = express.Router();

const goldController = require('../controllers/goldController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { authorizeRole } = require('../middlewares/authorizationMiddleware');

// ==========================
// 💰 Harga Emas
// ==========================

// GET: Ambil harga emas (publik)
router.get('/hargaanntam', goldController.getHargaAntam);

// POST: Set harga emas (admin only)
router.post('/set-harga', verifyToken, authorizeRole('admin'), goldController.setHargaAntam);

// ==========================
// 📦 Pembelian & Penjualan
// ==========================

// POST: Beli emas (user)
router.post('/beli', verifyToken, goldController.beliAntam);

// POST: Jual emas (user)
router.post('/jual', verifyToken, goldController.jualAntam);

// ==========================
// 📋 Transaksi (Admin)
// ==========================

// GET: Ambil semua transaksi (admin)
router.get('/transaksi', verifyToken, authorizeRole('admin'), goldController.getAllTransactions);

// POST: Setujui transaksi (admin)
router.post('/approve', verifyToken, authorizeRole('admin'), goldController.approveTransaction);

// POST: Tolak transaksi (admin)
router.post('/reject', verifyToken, authorizeRole('admin'), goldController.rejectTransaction);

module.exports = router;
