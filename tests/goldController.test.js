const goldController = require('../controllers/goldController');

// Mock dependencies
jest.mock('../models/goldModel', () => ({
  getGoldPrice: jest.fn(),
  setGoldPrice: jest.fn(),
  addTransaction: jest.fn(),
  getTransactions: jest.fn(),
  approveTransaction: jest.fn(),
  rejectTransaction: jest.fn(),
}));
jest.mock('../middlewares/uploadMiddleware', () => ({
  single: jest.fn(() => (req, res, cb) => cb(null)),
}));

const goldModel = require('../models/goldModel');
const upload = require('../middlewares/uploadMiddleware');

// Helper untuk mock response
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

describe('Gold Controller', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getHargaAntam', () => {
    it('should return harga emas', () => {
      const req = {};
      const res = mockResponse();

      goldModel.getGoldPrice.mockImplementation(cb => cb(null, [{ price_per_gram: 950000 }]));

      goldController.getHargaAntam(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ harga: 950000 });
    });

    it('should return 404 if no price set', () => {
      const req = {};
      const res = mockResponse();

      goldModel.getGoldPrice.mockImplementation(cb => cb(null, []));

      goldController.getHargaAntam(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Harga emas belum disetel' });
    });

    it('should handle error', () => {
      const req = {};
      const res = mockResponse();

      goldModel.getGoldPrice.mockImplementation(cb => cb(new Error('DB error')));

      goldController.getHargaAntam(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Gagal mengambil harga emas' });
    });
  });

  describe('setHargaAntam', () => {
    it('should set new price', () => {
      const req = { body: { newPrice: 980000 } };
      const res = mockResponse();

      goldModel.setGoldPrice.mockImplementation((price, cb) => cb(null));

      goldController.setHargaAntam(req, res);

      expect(goldModel.setGoldPrice).toHaveBeenCalledWith(980000, expect.any(Function));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Harga emas berhasil diubah menjadi 980000' });
    });

    it('should reject invalid price', () => {
      const req = { body: { newPrice: -100 } };
      const res = mockResponse();

      goldController.setHargaAntam(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Harga harus lebih besar dari 0' });
    });

    it('should handle DB error', () => {
      const req = { body: { newPrice: 990000 } };
      const res = mockResponse();

      goldModel.setGoldPrice.mockImplementation((price, cb) => cb(new Error('DB error')));

      goldController.setHargaAntam(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Gagal memperbarui harga emas' });
    });
  });

  describe('approveTransaction', () => {
    it('should approve transaction', () => {
      const req = { body: { transactionId: 1 } };
      const res = mockResponse();

      goldModel.approveTransaction.mockImplementation((id, cb) => cb(null));

      goldController.approveTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Transaksi 1 telah disetujui' });
    });

    it('should return 400 if no ID', () => {
      const req = { body: {} };
      const res = mockResponse();

      goldController.approveTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'ID transaksi wajib diisi' });
    });

    it('should handle DB error', () => {
      const req = { body: { transactionId: 1 } };
      const res = mockResponse();

      goldModel.approveTransaction.mockImplementation((id, cb) => cb(new Error('DB error')));

      goldController.approveTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Gagal menyetujui transaksi' });
    });
  });

  describe('rejectTransaction', () => {
    it('should reject transaction', () => {
      const req = { body: { transactionId: 1 } };
      const res = mockResponse();

      goldModel.rejectTransaction.mockImplementation((id, cb) => cb(null));

      goldController.rejectTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Transaksi 1 telah ditolak' });
    });

    it('should return 400 if no ID', () => {
      const req = { body: {} };
      const res = mockResponse();

      goldController.rejectTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'ID transaksi wajib diisi' });
    });

    it('should handle DB error', () => {
      const req = { body: { transactionId: 1 } };
      const res = mockResponse();

      goldModel.rejectTransaction.mockImplementation((id, cb) => cb(new Error('DB error')));

      goldController.rejectTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Gagal menolak transaksi' });
    });
  });

  describe('getAllTransactions', () => {
    it('should return transactions', () => {
      const req = {};
      const res = mockResponse();

      goldModel.getTransactions.mockImplementation(cb => cb(null, [{ id: 1 }]));

      goldController.getAllTransactions(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ transactions: [{ id: 1 }] });
    });

    it('should handle error', () => {
      const req = {};
      const res = mockResponse();

      goldModel.getTransactions.mockImplementation(cb => cb(new Error('DB error')));

      goldController.getAllTransactions(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Gagal mengambil daftar transaksi' });
    });
  });
});
