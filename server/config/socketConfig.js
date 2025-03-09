const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        throw new Error('Authentication error');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userType = decoded.userType;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.userId);

    // Join user's personal room
    socket.join(`user_${socket.userId}`);

    // Join role-based room
    socket.join(`${socket.userType.toLowerCase()}_room`);

    // Handle joining specific rooms (e.g., for consultations)
    socket.on('join_consultation', (consultationId) => {
      socket.join(`consultation_${consultationId}`);
    });

    // Handle leaving rooms
    socket.on('leave_consultation', (consultationId) => {
      socket.leave(`consultation_${consultationId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.userId);
    });
  });

  return io;
};

module.exports = {
  initialize: initializeSocket,
  getIO: () => {
    if (!io) {
      throw new Error('Socket.IO not initialized');
    }
    return io;
  }
}; 