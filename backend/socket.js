const { Server } = require('socket.io');
const userModel    = require('./models/user.model');
const captainModel = require('./models/captain.model');

let io;

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    /* ── Identify user/captain after login ── */
    socket.on('join', async ({ userId, userType }) => {
      try {
        if (userType === 'user') {
          await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
        } else if (userType === 'captain') {
          // Set active so they appear in ride broadcasts
          await captainModel.findByIdAndUpdate(userId, {
            socketId: socket.id,
            status: 'active',
          });
        }
        console.log(`[Socket] ${userType} ${userId} joined with socket ${socket.id}`);
      } catch (err) {
        console.error('[Socket] join error:', err.message);
      }
    });

    /* ── Captain sends live location ── */
    socket.on('update-location-captain', async ({ userId, location }) => {
      try {
        if (!location?.lat || !location?.lng) return;
        await captainModel.findByIdAndUpdate(userId, {
          location: { lat: location.lat, lng: location.lng },
        });

        // Broadcast to all users waiting for this captain
        // (ride controller will emit directly to user socketId)
        socket.broadcast.emit(`captain-location-${userId}`, location);
      } catch (err) {
        console.error('[Socket] location update error:', err.message);
      }
    });

    /* ── Disconnect: clear socketId ── */
    socket.on('disconnect', async () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
      try {
        await userModel.findOneAndUpdate({ socketId: socket.id }, { socketId: null });
        // Set captain inactive on disconnect so they don't receive new rides
        await captainModel.findOneAndUpdate(
          { socketId: socket.id },
          { socketId: null, status: 'inactive' }
        );
      } catch (err) {
        console.error('[Socket] disconnect cleanup error:', err.message);
      }
    });
  });
}

function sendMessageToSocketId(socketId, { event, data }) {
  if (io && socketId) {
    io.to(socketId).emit(event, data);
  }
}

module.exports = { initializeSocket, sendMessageToSocketId };
