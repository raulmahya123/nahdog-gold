const jewelryController = require('../controllers/jewelryController');

jest.mock('../models/jewelryModel', () => ({
  createProduct: jest.fn(),
  getAllProducts: jest.fn(),
  addTransaction: jest.fn(),
  getAllTransactions: jest.fn(),
  approveTransaction: jest.fn(),
  rejectTransaction: jest.fn(),
}));

jest.mock('../middlewares/uploadMiddleware', () => ({
  single: jest.fn(() => (req, res, cb) => cb(null)),
}));

const jewelryModel = require('../models/jewelryModel');
const upload = require('../middlewares/uploadMiddleware');

// Helper response mock
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

describe('Jewelry Controller', () => {
  afterEach(() => jest.clearAllMocks());

  // CREATE PRODUCT
  describe('createProduct', () => {
    it('should create a product successfully', () => {
      const req = { body: { name: 'Ring', description: 'Gold ring', price: '500000' } };
      const res = mockResponse();

      jewelryModel.createProduct.mockImplementation((name, desc, price, cb) =>
        cb(null, { insertId: 1 })
      );

      jewelryController.createProduct(req, res);

      expect(jewelryModel.createProduct).toHaveBeenCalledWith('Ring', 'Gold ring', 500000, expect.any(Function));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Produk berhasil ditambahkan', productId: 1 });
    });

    it('should return 400 if name or price missing', () => {
      const req = { body: { description: 'Gold ring' } };
      const res = mockResponse();

      jewelryController.createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Nama dan harga produk wajib diisi' });
    });

    it('should handle DB error', () => {
      const req = { body: { name: 'Ring', price: '500000' } };
      const res = mockResponse();

      jewelryModel.createProduct.mockImplementation((name, desc, price, cb) =>
        cb(new Error('DB error'))
      );

      jewelryController.createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Gagal membuat produk' });
    });
  });

  // GET ALL PRODUCTS
  describe('getAllProducts', () => {
    it('should return all products', () => {
      const req = {};
      const res = mockResponse();

      jewelryModel.getAllProducts.mockImplementation(cb => cb(null, [{ id: 1, name: 'Ring' }]));

      jewelryController.getAllProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ products: [{ id: 1, name: 'Ring' }] });
    });

    it('should handle error', () => {
      const req = {};
      const res = mockResponse();

      jewelryModel.getAllProducts.mockImplementation(cb => cb(new Error('DB error')));

      jewelryController.getAllProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Gagal mengambil produk' });
    });
  });

  // APPROVE TRANSACTION
  describe('approveTransaction', () => {
    it('should approve transaction', () => {
      const req = { body: { transactionId: 1 } };
      const res = mockResponse();

      jewelryModel.approveTransaction.mockImplementation((id, cb) => cb(null));

      jewelryController.approveTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Transaksi 1 telah disetujui' });
    });

    it('should return 400 if no ID', () => {
      const req = { body: {} };
      const res = mockResponse();

      jewelryController.approveTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'ID transaksi wajib diisi' });
    });

    it('should handle DB error', () => {
      const req = { body: { transactionId: 1 } };
      const res = mockResponse();

      jewelryModel.approveTransaction.mockImplementation((id, cb) => cb(new Error('DB error')));

      jewelryController.approveTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Gagal menyetujui transaksi' });
    });
  });

  // REJECT TRANSACTION
  describe('rejectTransaction', () => {
    it('should reject transaction', () => {
      const req = { body: { transactionId: 1 } };
      const res = mockResponse();

      jewelryModel.rejectTransaction.mockImplementation((id, cb) => cb(null));

      jewelryController.rejectTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Transaksi 1 telah ditolak' });
    });

    it('should return 400 if no ID', () => {
      const req = { body: {} };
      const res = mockResponse();

      jewelryController.rejectTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'ID transaksi wajib diisi' });
    });

    it('should handle DB error', () => {
      const req = { body: { transactionId: 1 } };
      const res = mockResponse();

      jewelryModel.rejectTransaction.mockImplementation((id, cb) => cb(new Error('DB error')));

      jewelryController.rejectTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Gagal menolak transaksi' });
    });
  });

  // GET ALL TRANSACTIONS
  describe('getAllTransactions', () => {
    it('should return transactions', () => {
      const req = {};
      const res = mockResponse();

      jewelryModel.getAllTransactions.mockImplementation(cb => cb(null, [{ id: 1 }]));

      jewelryController.getAllTransactions(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ transactions: [{ id: 1 }] });
    });

    it('should handle error', () => {
      const req = {};
      const res = mockResponse();

      jewelryModel.getAllTransactions.mockImplementation(cb => cb(new Error('DB error')));

      jewelryController.getAllTransactions(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Gagal mengambil transaksi' });
    });
  });
});
