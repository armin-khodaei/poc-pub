import express from 'express';
import cors from 'cors';
import signatureRoutes from './routes/signature.routes';
import { errorHandler } from './middleware/error.middleware';
import { NotFoundError } from './utils/errors';

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add a basic root route
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// The correct path will be /api/signatures/create
app.use('/api/signatures', signatureRoutes);

// Handle 404
app.use('*', (req, res, next) => {
  next(new NotFoundError('Route not found'));
});

// Error handling middleware
app.use(errorHandler);

export default app;
