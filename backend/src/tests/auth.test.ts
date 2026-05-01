import request from 'supertest';
import app from '../app';
import { prisma } from '../utils/prisma';

// Use a unique email for each test run to avoid unique constraint violations
const testEmail = `test.farmer.${Date.now()}@mail.com`;
const testPassword = 'password123';

describe('Auth API', () => {
  // Clean up the created test user after tests
  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: 'test.farmer.' } },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new FARMER user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test Farmer',
          email: testEmail,
          password: testPassword,
          role: 'FARMER',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe(testEmail);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should fail to register with duplicate email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test Farmer 2',
          email: testEmail,
          password: testPassword,
          role: 'FARMER',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONFLICT');
    });

    it('should fail validation if password is too short', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Short Pass',
          email: 'short@mail.com',
          password: '12',
          role: 'FARMER',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should fail if trying to register as ADMIN', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Hacker',
          email: 'hacker@mail.com',
          password: 'password123',
          role: 'ADMIN',
        });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully and return a token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(testEmail);
    });

    it('should fail with wrong password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should fail with unregistered email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'not.registered.ever@mail.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
