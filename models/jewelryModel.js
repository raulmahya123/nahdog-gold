const db = require('../config/db');

module.exports = {
  // ========== ADMIN ==========

  // Tambah produk perhiasan baru
  createProduct: (name, description, price, callback) => {
    const query = `
      INSERT INTO jewelry_products (name, description, price)
      VALUES (?, ?, ?)
    `;
    db.query(query, [name, description, price], callback);
  },

  // Ambil semua produk
  getAllProducts: (callback) => {
    const query = `SELECT * FROM jewelry_products ORDER BY created_at DESC`;
    db.query(query, callback);
  },

  // Ambil detail produk berdasarkan ID
  getProductById: (productId, callback) => {
    const query = `SELECT * FROM jewelry_products WHERE id = ?`;
    db.query(query, [productId], callback);
  },

  // ========== USER / TRANSAKSI ==========

  // Tambah transaksi pembelian perhiasan
  addTransaction: (userId, productId, quantity, proof, deliveryMethod, address, callback) => {
    const productQuery = `SELECT price FROM jewelry_products WHERE id = ?`;

    db.query(productQuery, [productId], (err, result) => {
      if (err) return callback(err);
      if (result.length === 0) return callback(new Error('Produk tidak ditemukan'));

      const price = result[0].price;
      const totalPrice = price * parseInt(quantity);

      const insertQuery = `
        INSERT INTO jewelry_transactions 
        (user_id, product_id, quantity, total_price, proof, status, delivery_method, address)
        VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
      `;

      const finalAddress = deliveryMethod === 'office' ? null : address;

      db.query(insertQuery, [
        userId,
        productId,
        quantity,
        totalPrice,
        proof,
        deliveryMethod,
        finalAddress
      ], (err, resultInsert) => {
        if (err) return callback(err);
        callback(null, {
          insertId: resultInsert.insertId,
          totalPrice: totalPrice
        });
      });
    });
  },

  // Ambil semua transaksi perhiasan
  getAllTransactions: (callback) => {
    const query = `
      SELECT jt.*, jp.name AS product_name, u.name AS user_name
      FROM jewelry_transactions jt
      JOIN jewelry_products jp ON jt.product_id = jp.id
      JOIN users u ON jt.user_id = u.id
      ORDER BY jt.created_at DESC
    `;
    db.query(query, callback);
  },

  // Approve transaksi
  approveTransaction: (transactionId, callback) => {
    const query = `UPDATE jewelry_transactions SET status = 'approved' WHERE id = ?`;
    db.query(query, [transactionId], callback);
  },

  // Reject transaksi
  rejectTransaction: (transactionId, callback) => {
    const query = `UPDATE jewelry_transactions SET status = 'rejected' WHERE id = ?`;
    db.query(query, [transactionId], callback);
  }
};
