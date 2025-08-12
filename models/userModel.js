// models/userModel.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

module.exports = {
  // Registrasi
  registerUser: (name, email, password, role, callback) => {
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return callback(err);
      const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
      db.query(query, [name, email, hashedPassword, role || 'user'], callback);
    });
  },

  // Cari user by email
  findUserByEmail: (email, callback) => {
    const query = 'SELECT id, name, email, password, role FROM users WHERE email = ? LIMIT 1';
    db.query(query, [email], callback);
  },

  // Update password by user id
  updateUserPassword: (id, hashedPassword, callback) => {
    const sql = 'UPDATE users SET password = ? WHERE id = ?';
    db.query(sql, [hashedPassword, id], callback);
  },
};
