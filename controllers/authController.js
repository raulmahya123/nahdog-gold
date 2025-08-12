// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
require('dotenv').config();

// REGISTER (tetap)
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  userModel.registerUser(name, email, password, role, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'User registered successfully' });
  });
};

// LOGIN (tetap, saran: pakai process.env.JWT_SECRET)
exports.login = (req, res) => {
  const { email, password } = req.body;

  userModel.findUserByEmail(email, async (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!result || result.length === 0) return res.status(400).json({ message: 'User not found' });

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const role = user.role || 'user';
    const token = jwt.sign({ userId: user.id, role }, process.env.JWT_SECRET || 'your_jwt_secret_key', { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  });
};

// === NEW === Ganti password dengan email (gmail) + password lama
exports.changePasswordByEmail = (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ message: 'email, currentPassword, dan newPassword wajib diisi' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'Password baru minimal 8 karakter' });
  }

  // 1) Cari user by email
  userModel.findUserByEmail(email, async (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });

    const user = rows[0];

    // 2) Cek password lama
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ message: 'Password lama salah' });

    // 3) Hash password baru & update
    try {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(newPassword, salt);
      userModel.updateUserPassword(user.id, hashed, (e2) => {
        if (e2) return res.status(500).json({ error: e2.message });
        return res.status(200).json({ message: 'Password berhasil diupdate' });
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });
};
