# REST API Server

A robust REST API server with authentication, rate limiting, and comprehensive documentation. Built with Node.js and Express.

## Features

- 🔐 **JWT Authentication** - Secure user authentication with JSON Web Tokens
- 🛡️ **Rate Limiting** - Protection against abuse and DDoS attacks
- 📚 **Swagger Documentation** - Interactive API documentation
- 🔒 **Security Headers** - Helmet.js for security best practices
- ✅ **Input Validation** - Express-validator for request validation
- 📝 **Logging** - Morgan for HTTP request logging
- 🌐 **CORS Support** - Cross-Origin Resource Sharing configuration
- 🚀 **Production Ready** - Environment configuration and error handling

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Swagger** - API documentation
- **Helmet** - Security middleware
- **express-rate-limit** - Rate limiting
- **express-validator** - Input validation

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd rest-api-server
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=http://localhost:3000
```

5. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Documentation

Once the server is running, you can access the interactive API documentation at:
- **Swagger UI**: `http://localhost:3000/api-docs`

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user by ID
- `DELETE /api/users/:id` - Delete user by ID (Admin only)
- `GET /api/users/stats` - Get user statistics (Admin only)

### Health Check
- `GET /health` - Health check endpoint

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Default Admin User

The application comes with a default admin user:
- **Email**: `admin@example.com`
- **Password**: `password123`

## Rate Limiting

The API implements rate limiting to prevent abuse:
- Default: 100 requests per 15 minutes per IP
- Configurable via environment variables

## Security Features

- **Helmet.js** - Sets various HTTP headers for security
- **CORS** - Configurable Cross-Origin Resource Sharing
- **Rate Limiting** - Prevents brute force attacks
- **Input Validation** - Validates all incoming requests
- **Password Hashing** - Uses bcrypt for secure password storage
- **JWT Tokens** - Stateless authentication

## Error Handling

The API includes comprehensive error handling:
- Validation errors return detailed information
- JWT errors are properly handled
- 404 errors for unknown routes
- 500 errors with stack traces in development

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `CORS_ORIGIN` | CORS origin | `http://localhost:3000` |

## Development

### Project Structure

```
src/
├── middleware/
│   ├── auth.js          # JWT authentication middleware
│   ├── errorHandler.js  # Global error handler
│   └── validation.js    # Input validation middleware
├── models/
│   └── User.js          # User model (in-memory storage)
├── routes/
│   ├── auth.js          # Authentication routes
│   └── users.js         # User management routes
└── server.js            # Main application file
```

### Adding New Routes

1. Create a new route file in `src/routes/`
2. Add route documentation using Swagger JSDoc comments
3. Import and use the route in `src/server.js`

### Database Integration

The current implementation uses in-memory storage for simplicity. For production, integrate with a database:

1. Install database driver (e.g., `mongoose` for MongoDB, `pg` for PostgreSQL)
2. Update the User model to use the database
3. Add connection configuration to environment variables

## Testing

Run tests with:
```bash
npm test
```

For continuous testing during development:
```bash
npm run test:watch
```

## Deployment

### Production Checklist

1. Set strong `JWT_SECRET`
2. Configure appropriate `CORS_ORIGIN`
3. Set up database connection
4. Configure logging
5. Set up monitoring
6. Use HTTPS
7. Configure rate limiting for production load

### Docker Deployment

Create a `Dockerfile`:
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
