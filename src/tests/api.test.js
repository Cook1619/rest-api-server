const request = require('supertest')
const app = require('../src/server')

describe('API Endpoints', () => {
  let authToken
  let userId

  describe('Authentication', () => {
    test('POST /api/auth/register should create a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('user')
      expect(response.body.user.email).toBe(userData.email)
      expect(response.body.user.username).toBe(userData.username)
      expect(response.body.user).not.toHaveProperty('password')

      authToken = response.body.token
      userId = response.body.user.id
    })

    test('POST /api/auth/register should fail with duplicate email', async () => {
      const userData = {
        username: 'testuser2',
        email: 'test@example.com', // Same email as previous test
        password: 'Password123',
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    test('POST /api/auth/login should authenticate user', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Password123',
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200)

      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('user')
      expect(response.body.user).not.toHaveProperty('password')
    })

    test('POST /api/auth/login should fail with wrong password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword',
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401)

      expect(response.body).toHaveProperty('error')
    })

    test('GET /api/auth/me should return current user', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('username')
      expect(response.body).toHaveProperty('email')
      expect(response.body).not.toHaveProperty('password')
    })

    test('GET /api/auth/me should fail without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('Users', () => {
    test('GET /api/users/:id should return user profile', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('id', userId)
      expect(response.body).toHaveProperty('username')
      expect(response.body).toHaveProperty('email')
      expect(response.body).not.toHaveProperty('password')
    })

    test('PUT /api/users/:id should update user profile', async () => {
      const updateData = {
        username: 'updateduser',
      }

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body).toHaveProperty('user')
      expect(response.body.user.username).toBe(updateData.username)
    })

    test('GET /api/users should require admin access', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('Health Check', () => {
    test('GET /health should return server status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)

      expect(response.body).toHaveProperty('status', 'OK')
      expect(response.body).toHaveProperty('timestamp')
      expect(response.body).toHaveProperty('uptime')
    })
  })

  describe('Root Endpoint', () => {
    test('GET / should return API information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200)

      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('version')
      expect(response.body).toHaveProperty('documentation')
    })
  })

  describe('404 Handler', () => {
    test('Unknown routes should return 404', async () => {
      const response = await request(app)
        .get('/api/unknown-route')
        .expect(404)

      expect(response.body).toHaveProperty('error', 'Route not found')
    })
  })
})
