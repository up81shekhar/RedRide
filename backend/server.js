const http = require('http');
const app  = require('./app');
const { initializeSocket } = require('./socket');

const port   = process.env.PORT || 4000;
const server = http.createServer(app);

initializeSocket(server);

server.listen(port, '0.0.0.0', () => {
  console.log(`[RedRide] Server running on port ${port}`);
});
