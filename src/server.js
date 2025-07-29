const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const swaggerUi = require('swagger-ui-express')
const swaggerJsdoc = require('swagger-jsdoc')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/users')
const errorHandler = require('./middleware/errorHandler')

const app = express()
const PORT = process.env.PORT || 3000

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'REST API Server',
      version: '1.0.0',
      description: 'A robust REST API server with authentication, rate limiting, and comprehensive documentation',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
}

const specs = swaggerJsdoc(swaggerOptions)

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Middleware
app.use(helmet()) // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}))
app.use(morgan('combined')) // Logging
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(limiter) // Apply rate limiting to all requests

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to REST API Server',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health',
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist.`,
  })
})

// Error handling middleware
app.use(errorHandler)

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`)
  console.log(`🏥 Health check available at http://localhost:${PORT}/health`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...')
  server.close(() => {
    console.log('Process terminated')
  })
})

module.exports = app
