const multer = require('multer');

// Menyimpan file gambar ke folder 'uploads/'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Tentukan folder tempat menyimpan file
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);  // Menyimpan file dengan nama unik
  }
});

// Filter file (opsional): hanya menerima gambar
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);  // Terima file gambar
  } else {
    cb(new Error('Only image files are allowed!'), false);  // Menolak file non-gambar
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
