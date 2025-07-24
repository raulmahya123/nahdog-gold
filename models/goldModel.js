const db = require('../config/db');

module.exports = {
  // Ambil harga emas per gram terbaru
  getGoldPrice: (callback) => {
    const query = 'SELECT price_per_gram FROM gold_price ORDER BY updated_at DESC LIMIT 1';
    db.query(query, callback);
  },

  // Set harga emas per gram (Admin)
  setGoldPrice: (newPrice, callback) => {
    const query = 'UPDATE gold_price SET price_per_gram = ? ORDER BY updated_at DESC LIMIT 1';
    db.query(query, [newPrice], callback);
  },

  // Tambah transaksi pembelian (purchase) atau penjualan (sell)
  addTransaction: (userId, amount, proof, transactionType, deliveryMethod, address, callback) => {
    const getPriceQuery = 'SELECT price_per_gram FROM gold_price ORDER BY updated_at DESC LIMIT 1';

    db.query(getPriceQuery, (err, results) => {
      if (err) return callback(err);
      if (results.length === 0) return callback(new Error('Harga emas belum diatur'));

      const pricePerGram = results[0].price_per_gram;
      const totalPrice = pricePerGram * parseFloat(amount);

      const insertQuery = `
        INSERT INTO gold_transactions 
        (user_id, amount, total_price, proof, status, transaction_type, delivery_method, address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const finalAddress = deliveryMethod === 'office' ? null : address;

      db.query(insertQuery, [
        userId,
        amount,
        totalPrice,
        proof,
        'pending',
        transactionType, // 'purchase' or 'sell'
        deliveryMethod,  // 'cod' or 'office'
        finalAddress
      ], callback);
    });
  },

  // Ambil semua transaksi
  getTransactions: (callback) => {
    const query = 'SELECT * FROM gold_transactions ORDER BY created_at DESC';
    db.query(query, callback);
  },

  // Approve transaksi (ubah status ke approved)
  approveTransaction: (transactionId, callback) => {
    const query = 'UPDATE gold_transactions SET status = ? WHERE id = ?';
    db.query(query, ['approved', transactionId], callback);
  },

  // Reject transaksi (ubah status ke rejected)
  rejectTransaction: (transactionId, callback) => {
    const query = 'UPDATE gold_transactions SET status = ? WHERE id = ?';
    db.query(query, ['rejected', transactionId], callback);
  },
};
