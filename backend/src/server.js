/**
 * Server Entry Point
 * Starts the Express server
 */

import app from "./app.js";
import { env } from "./config/env.js";

const PORT = env.port;

// Start server
const server = app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ========================================');
  console.log('🎓 TCE-Connect Backend Server');
  console.log('🚀 ========================================');
  console.log(`📍 Environment: ${env.nodeEnv}`);
  console.log(`🌐 Server running on port: ${PORT}`);
  console.log(`🔗 Local: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Base: http://localhost:${PORT}/api`);
  console.log('🚀 ========================================');
  console.log('');
  console.log('✅ Server running on http://localhost:' + PORT);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

export default server;
