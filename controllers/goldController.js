const goldModel = require('../models/goldModel');
const upload = require('../middlewares/uploadMiddleware');

// Ambil harga emas
exports.getHargaAntam = (req, res) => {
  goldModel.getGoldPrice((err, result) => {
    if (err) return res.status(500).json({ message: 'Gagal mengambil harga emas' });
    if (result.length === 0) return res.status(404).json({ message: 'Harga emas belum disetel' });
    res.status(200).json({ harga: result[0].price_per_gram });
  });
};

// Set harga emas (admin)
exports.setHargaAntam = (req, res) => {
  const { newPrice } = req.body;
  if (!newPrice || newPrice <= 0) {
    return res.status(400).json({ message: 'Harga harus lebih besar dari 0' });
  }

  goldModel.setGoldPrice(newPrice, (err) => {
    if (err) return res.status(500).json({ message: 'Gagal memperbarui harga emas' });
    res.status(200).json({ message: `Harga emas berhasil diubah menjadi ${newPrice}` });
  });
};

// Pembelian emas
exports.beliAntam = (req, res) => {
  upload.single('proof')(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });

    let { amount, deliveryMethod, address } = req.body;
    amount = parseFloat(amount);
    const proof = req.file ? req.file.path : null;
// total harga yg di beli 
    if (!amount || !proof || !deliveryMethod) {
      return res.status(400).json({ message: 'Jumlah, metode pengambilan, dan bukti transfer wajib diisi' });
    }

    if (deliveryMethod === 'cod' && !address) {
      return res.status(400).json({ message: 'Alamat wajib diisi jika memilih COD' });
    }

    goldModel.addTransaction(
      req.user.userId,
      amount,
      proof,
      'purchase',
      deliveryMethod,
      deliveryMethod === 'cod' ? address : null,
      (err, result) => {
        if (err) return res.status(500).json({ message: 'Gagal membuat transaksi pembelian' });
        res.status(201).json({
          message: '✅ Selamat, transaksi pembelian emas berhasil dibuat!',
          transactionId: result.insertId,
          totalPrice: result.totalPrice
        });
      }
    );
  });
};

// Penjualan emas
exports.jualAntam = (req, res) => {
  upload.single('proof')(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });

    let { amount, deliveryMethod, address } = req.body;
    amount = parseFloat(amount);
    const proof = req.file ? req.file.path : null;

    if (!amount || !proof || !deliveryMethod) {
      return res.status(400).json({ message: 'Jumlah, metode pengambilan, dan bukti transfer wajib diisi' });
    }

    if (deliveryMethod === 'cod' && !address) {
      return res.status(400).json({ message: 'Alamat wajib diisi jika memilih COD' });
    }

    goldModel.addTransaction(
      req.user.userId,
      amount,
      proof,
      'sale',
      deliveryMethod,
      deliveryMethod === 'cod' ? address : null,
      (err, result) => {
        if (err) return res.status(500).json({ message: 'Gagal membuat transaksi penjualan' });
        res.status(201).json({
          message: '✅ Selamat, transaksi penjualan emas berhasil dibuat!',
          transactionId: result.insertId,
          totalPrice: result.totalPrice
        });
      }
    );
  });
};

// Ambil semua transaksi (admin)
exports.getAllTransactions = (req, res) => {
  goldModel.getTransactions((err, transactions) => {
    if (err) return res.status(500).json({ message: 'Gagal mengambil daftar transaksi' });
    res.status(200).json({ transactions });
  });
};

// Setujui transaksi (admin)
exports.approveTransaction = (req, res) => {
  const { transactionId } = req.body;
  if (!transactionId) return res.status(400).json({ message: 'ID transaksi wajib diisi' });

  goldModel.approveTransaction(transactionId, (err) => {
    if (err) return res.status(500).json({ message: 'Gagal menyetujui transaksi' });
    res.status(200).json({ message: `Transaksi ${transactionId} telah disetujui` });
  });
};

// Tolak transaksi (admin)
exports.rejectTransaction = (req, res) => {
  const { transactionId } = req.body;
  if (!transactionId) return res.status(400).json({ message: 'ID transaksi wajib diisi' });

  goldModel.rejectTransaction(transactionId, (err) => {
    if (err) return res.status(500).json({ message: 'Gagal menolak transaksi' });
    res.status(200).json({ message: `Transaksi ${transactionId} telah ditolak` });
  });
};
