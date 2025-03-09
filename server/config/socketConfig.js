const socketIO = require('socket.io');

let io;

module.exports = {
  init: (httpServer) => {
    io = socketIO(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join_consultation', (consultationId) => {
        socket.join(`consultation_${consultationId}`);
      });

      socket.on('update_financial_data', (data) => {
        io.to(`consultation_${data.consultationId}`).emit('financial_data_updated', data);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
}; 