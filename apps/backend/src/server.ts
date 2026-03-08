import app from './app';
import { config } from './config/env';
import { testDatabaseConnection, closeDatabaseConnection } from './config/db';
import { notificationScheduler } from './services/notificationScheduler.service';
import { autoBackupScheduler } from './services/autoBackupScheduler.service';

async function startServer() {
  try {
    // Test database connection — warn but do NOT exit, so the server
    // can still respond to health checks and return proper error messages
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      console.error('⚠️  Database connection failed. Server will start anyway.');
      console.error('⚠️  Set DATABASE_URL environment variable in Vercel Dashboard → Project Settings → Environment Variables.');
    }

    // Initialize schedulers only if DB is connected
    if (dbConnected) {
      await autoBackupScheduler.initialize();
      notificationScheduler.start();
    }

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
