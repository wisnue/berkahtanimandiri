import app from './app';
import { config } from './config/env';
import { testDatabaseConnection, closeDatabaseConnection } from './config/db';
import { notificationScheduler } from './services/notificationScheduler.service';
import { autoBackupScheduler } from './services/autoBackupScheduler.service';

async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      console.error('❌ Cannot start server without database connection');
      process.exit(1);
    }

    // Initialize backup scheduler
    await autoBackupScheduler.initialize();

    // Start notification scheduler
    notificationScheduler.start();

    // Start server
    const server = app.listen(config.port, () => {
      console.log('\n🌳 KTH BTM Server Started');
      console.log('================================');
      console.log(`Environment: ${config.env}`);
      console.log(`Server: http://localhost:${config.port}`);
      console.log(`Health: http://localhost:${config.port}/health`);
      console.log(`API: http://localhost:${config.port}/api`);
      console.log('================================\n');
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      
      // Stop scheduler
      notificationScheduler.stop();
      
      server.close(async () => {
        console.log('HTTP server closed');
        await closeDatabaseConnection();
        console.log('Shutdown complete');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('Forcing shutdown...');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
