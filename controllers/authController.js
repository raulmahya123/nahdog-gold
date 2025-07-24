const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// Fungsi untuk registrasi pengguna
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  userModel.registerUser(name, email, password, role, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'User registered successfully' });
  });
};

// Fungsi untuk login pengguna
// Fungsi untuk login pengguna
exports.login = (req, res) => {
  const { email, password } = req.body;

  // Cari pengguna berdasarkan email
  userModel.findUserByEmail(email, async (err, result) => {
    if (err) {
      console.log("Error finding user:", err);  // Debugging error
      return res.status(500).json({ error: err.message });
    }

    if (result.length === 0) {
      console.log("User not found:", email);  // Debugging jika email tidak ditemukan
      return res.status(400).json({ message: 'User not found' });
    }

    const user = result[0];

    // Verifikasi password yang dimasukkan dengan hash yang ada di database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Invalid password for user:", email);  // Debugging password tidak cocok
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Tentukan role berdasarkan user atau hardcode role sebagai contoh
    const role = user.role || 'user';  // Ambil role dari database atau default 'user'

    // Generate JWT token dengan userId dan role
    const token = jwt.sign({ userId: user.id, role }, 'your_jwt_secret_key', {
      expiresIn: '1h',
    });

    res.status(200).json({ message: 'Login successful', token });
  });
};

