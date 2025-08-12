// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Registrasi & login
router.post('/register', authController.register);
router.post('/login', authController.login);

// === NEW === Ganti password via email (gmail)
router.put('/password/by-email', authController.changePasswordByEmail);

module.exports = router;
