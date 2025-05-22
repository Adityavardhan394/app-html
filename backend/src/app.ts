import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const httpServer = createServer(app);

// Setup Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import medicineRoutes from './routes/medicine.routes';
import orderRoutes from './routes/order.routes';
import adminRoutes from './routes/admin.routes';
import riderRoutes from './routes/rider.routes';
import prescriptionRoutes from './routes/prescription.routes';

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/rider', riderRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

// Socket.IO Events
io.on('connection', (socket) => {
  console.log('A user connected');

  // Join order tracking room
  socket.on('join-order-tracking', (orderId: string) => {
    socket.join(`order-${orderId}`);
  });

  // Update rider location
  socket.on('update-rider-location', (data: { orderId: string; location: { lat: number; lng: number } }) => {
    io.to(`order-${data.orderId}`).emit('rider-location-updated', data.location);
  });

  // Handle customer support chat
  socket.on('join-support-chat', (userId: string) => {
    socket.join(`support-${userId}`);
  });

  socket.on('send-support-message', (data: { userId: string; message: string }) => {
    io.to(`support-${data.userId}`).emit('new-support-message', data.message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mediquick')
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Start server
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app; 