// tests/userController.test.js
const userController = require('../controllers/authController');

// Mock dependency
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));
jest.mock('../models/userModel', () => ({
  registerUser: jest.fn(),
  findUserByEmail: jest.fn(),
}));

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// Helper untuk mock req/res
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

describe('User Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const req = {
        body: {
          name: 'Bagas',
          email: 'bagas@mail.com',
          password: 'secret',
          role: 'user',
        },
      };
      const res = mockResponse();

      userModel.registerUser.mockImplementation((name, email, password, role, cb) => {
        cb(null, { insertId: 1 });
      });

      await userController.register(req, res);

      expect(userModel.registerUser).toHaveBeenCalledWith(
        'Bagas',
        'bagas@mail.com',
        'secret',
        'user',
        expect.any(Function)
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'User registered successfully' });
    });

    it('should handle DB error on register', async () => {
      const req = { body: { name: 'A', email: 'a@a.com', password: 'x', role: 'user' } };
      const res = mockResponse();

      userModel.registerUser.mockImplementation((n, e, p, r, cb) => {
        cb(new Error('DB error'), null);
      });

      await userController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
    });
  });

  describe('login', () => {
    it('should return 400 if user not found', async () => {
      const req = { body: { email: 'notfound@mail.com', password: 'pass' } };
      const res = mockResponse();

      userModel.findUserByEmail.mockImplementation((email, cb) => {
        cb(null, []); // kosong -> tidak ketemu
      });

      await userController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 400 if password invalid', async () => {
      const req = { body: { email: 'u@mail.com', password: 'wrong' } };
      const res = mockResponse();

      userModel.findUserByEmail.mockImplementation((email, cb) => {
        cb(null, [{ id: 1, password: 'hashed', role: 'user' }]);
      });
      bcrypt.compare.mockResolvedValue(false); // password tidak cocok

      await userController.login(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith('wrong', 'hashed');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('should login successfully and return token', async () => {
      const req = { body: { email: 'u@mail.com', password: 'right' } };
      const res = mockResponse();

      userModel.findUserByEmail.mockImplementation((email, cb) => {
        cb(null, [{ id: 1, password: 'hashed', role: 'admin' }]);
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mock-token');

      await userController.login(req, res);

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 1, role: 'admin' },
        'your_jwt_secret_key',
        { expiresIn: '1h' }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Login successful', token: 'mock-token' });
    });

    it('should handle DB error on login', async () => {
      const req = { body: { email: 'u@mail.com', password: 'x' } };
      const res = mockResponse();

      userModel.findUserByEmail.mockImplementation((email, cb) => {
        cb(new Error('DB error'), null);
      });

      await userController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
    });
  });
});
