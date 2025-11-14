const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const config = require('../src/config');

describe('Auth API', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(config.mongoUri);
    }
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $in: ['test@example.com', 'testdoctor@example.com'] } });
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new patient', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Patient',
          email: 'test@example.com',
          password: 'Password123',
          role: 'patient',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('should register a new doctor', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Doctor',
          email: 'testdoctor@example.com',
          password: 'Password123',
          role: 'doctor',
          specialties: ['Cardiology'],
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.user.role).toBe('doctor');
    });

    it('should reject registration with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test',
          email: 'test2@example.com',
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should reject login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword',
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /health', () => {
    it('should return 200', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('OK');
    });
  });
});

