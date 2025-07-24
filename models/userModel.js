const db = require('../config/db');
const bcrypt = require('bcryptjs');

module.exports = {
  // Fungsi untuk registrasi pengguna baru
  registerUser: (name, email, password, role, callback) => {
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return callback(err);

      const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
      db.query(query, [name, email, hashedPassword, role], callback);
    });
  },

  // Fungsi untuk mencari pengguna berdasarkan email
  findUserByEmail: (email, callback) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], callback);
  },
};
