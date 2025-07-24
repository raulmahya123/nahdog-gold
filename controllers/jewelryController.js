const jewelryModel = require('../models/jewelryModel');
const upload = require('../middlewares/uploadMiddleware');

// Admin: Tambah produk perhiasan
exports.createProduct = (req, res) => {
  const { name, description, price } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: 'Nama dan harga produk wajib diisi' });
  }

  jewelryModel.createProduct(name, description, parseFloat(price), (err, result) => {
    if (err) return res.status(500).json({ message: 'Gagal membuat produk' });
    res.status(201).json({ message: 'Produk berhasil ditambahkan', productId: result.insertId });
  });
};

// Get semua produk perhiasan
exports.getAllProducts = (req, res) => {
  jewelryModel.getAllProducts((err, products) => {
    if (err) return res.status(500).json({ message: 'Gagal mengambil produk' });
    res.status(200).json({ products });
  });
};

// User: Beli perhiasan
exports.buyJewelry = (req, res) => {
  upload.single('proof')(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });

    const { productId, quantity, deliveryMethod, address } = req.body;
    const proof = req.file ? req.file.path : null;

    if (!productId || !quantity || !deliveryMethod || !proof) {
      return res.status(400).json({ message: 'Semua data wajib diisi (produk, jumlah, metode, bukti)' });
    }

    if (deliveryMethod === 'cod' && !address) {
      return res.status(400).json({ message: 'Alamat wajib diisi untuk pengambilan COD' });
    }

    jewelryModel.addTransaction(
      req.user.userId,
      productId,
      quantity,
      proof,
      deliveryMethod,
      deliveryMethod === 'cod' ? address : null,
      (err, result) => {
        if (err) return res.status(500).json({ message: 'Gagal membuat transaksi' });
        res.status(201).json({
          message: '✅ Transaksi pembelian perhiasan berhasil dibuat!',
          transactionId: result.insertId,
          totalPrice: result.totalPrice
        });
      }
    );
  });
};

// Admin: Lihat semua transaksi
exports.getAllTransactions = (req, res) => {
  jewelryModel.getAllTransactions((err, transactions) => {
    if (err) return res.status(500).json({ message: 'Gagal mengambil transaksi' });
    res.status(200).json({ transactions });
  });
};

// Admin: Approve transaksi
exports.approveTransaction = (req, res) => {
  const { transactionId } = req.body;

  if (!transactionId) return res.status(400).json({ message: 'ID transaksi wajib diisi' });

  jewelryModel.approveTransaction(transactionId, (err) => {
    if (err) return res.status(500).json({ message: 'Gagal menyetujui transaksi' });
    res.status(200).json({ message: `Transaksi ${transactionId} telah disetujui` });
  });
};

// Admin: Reject transaksi
exports.rejectTransaction = (req, res) => {
  const { transactionId } = req.body;

  if (!transactionId) return res.status(400).json({ message: 'ID transaksi wajib diisi' });

  jewelryModel.rejectTransaction(transactionId, (err) => {
    if (err) return res.status(500).json({ message: 'Gagal menolak transaksi' });
    res.status(200).json({ message: `Transaksi ${transactionId} telah ditolak` });
  });
};
