import { Request, Response, NextFunction } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { emailService } from '../services/email.service';
import { notificationScheduler } from '../services/notificationScheduler.service';

const execAsync = promisify(exec);

// Backup database
export const backupDatabase = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '../../backups');
    const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);

    // Create backups directory if not exists
    await fs.mkdir(backupDir, { recursive: true });

    // PostgreSQL backup command
    const dbUrl = process.env.DATABASE_URL!;
    const command = `pg_dump "${dbUrl}" > "${backupFile}"`;

    await execAsync(command);

    // Get file size
    const stats = await fs.stat(backupFile);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    res.json({
      success: true,
      message: 'Backup berhasil dibuat',
      backup: {
        filename: path.basename(backupFile),
        path: backupFile,
        size: `${sizeInMB} MB`,
        timestamp
      }
    });
  } catch (error: any) {
    console.error('Backup error:', error);
    next(error);
  }
};

// Get backup history
export const getBackupHistory = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const backupDir = path.join(__dirname, '../../backups');
    
    try {
      await fs.access(backupDir);
    } catch {
      return res.json({ backups: [] });
    }

    const files = await fs.readdir(backupDir);
    const backups = await Promise.all(
      files
        .filter(f => f.endsWith('.sql'))
        .map(async (file) => {
          const filePath = path.join(backupDir, file);
          const stats = await fs.stat(filePath);
          return {
            id: file,
            filename: file,
            date: stats.mtime.toISOString(),
            size: `${(stats.size / (1024 * 1024)).toFixed(2)} MB`,
            type: file.includes('auto') ? 'auto' : 'manual'
          };
        })
    );

    backups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json({ backups });
  } catch (error) {
    next(error);
  }
};

// Download backup
export const downloadBackup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { filename } = req.params;
    const backupDir = path.join(__dirname, '../../backups');
    const filePath = path.join(backupDir, filename);

    // Security check
    if (!filename.endsWith('.sql') || filename.includes('..')) {
      return res.status(400).json({ message: 'Invalid filename' });
    }

    await fs.access(filePath);
    res.download(filePath);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ message: 'Backup file not found' });
    }
    next(error);
  }
};

// Restore database
export const restoreDatabase = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No backup file provided' });
    }

    const backupFile = req.file.path;
    const dbUrl = process.env.DATABASE_URL!;

    // Restore command
    const command = `psql "${dbUrl}" < "${backupFile}"`;
    await execAsync(command);

    // Clean up uploaded file
    await fs.unlink(backupFile);

    res.json({
      success: true,
      message: 'Database berhasil di-restore'
    });
  } catch (error: any) {
    console.error('Restore error:', error);
    next(error);
  }
};

// Get system settings
export const getSystemSettings = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // In real app, these would be stored in database
    const settings = {
      sessionTimeout: '30',
      maxLoginAttempts: '5',
      passwordExpiry: '90',
      enableEmailNotif: true,
      enableSMSNotif: false,
      maintenanceMode: false,
      autoBackup: true,
      backupSchedule: '03:00'
    };

    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// Update system settings
export const updateSystemSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const settings = req.body;
    
    // In real app, save to database
    // For now, just return success
    
    res.json({
      success: true,
      message: 'Pengaturan sistem berhasil disimpan',
      settings
    });
  } catch (error) {
    next(error);
  }
};

// Get all roles
export const getRoles = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // In real app, this would come from database
    const roles = [
      {
        id: 1,
        name: 'admin',
        displayName: 'Admin',
        permissions: ['all'],
        userCount: 1,
        color: 'red'
      },
      {
        id: 2,
        name: 'ketua',
        displayName: 'Ketua',
        permissions: ['view', 'create', 'edit', 'verify'],
        userCount: 1,
        color: 'blue'
      },
      {
        id: 3,
        name: 'sekretaris',
        displayName: 'Sekretaris',
        permissions: ['view', 'create', 'edit'],
        userCount: 2,
        color: 'green'
      },
      {
        id: 4,
        name: 'bendahara',
        displayName: 'Bendahara',
        permissions: ['view', 'create', 'edit'],
        userCount: 1,
        color: 'yellow'
      },
      {
        id: 5,
        name: 'anggota',
        displayName: 'Anggota',
        permissions: ['view'],
        userCount: 25,
        color: 'gray'
      }
    ];

    res.json({ roles });
  } catch (error) {
    next(error);
  }
};

// Create role
export const createRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, displayName, permissions, color } = req.body;

    // Validation
    if (!name || !displayName || !permissions) {
      return res.status(400).json({ 
        message: 'Name, display name, and permissions are required' 
      });
    }

    // In real app, save to database
    const newRole = {
      id: Date.now(),
      name,
      displayName,
      permissions,
      color: color || 'gray',
      userCount: 0
    };

    res.status(201).json({
      success: true,
      message: 'Role berhasil dibuat',
      role: newRole
    });
  } catch (error) {
    next(error);
  }
};

// Update role
export const updateRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { displayName, permissions, color } = req.body;

    // In real app, update in database
    const updatedRole = {
      id: parseInt(id),
      displayName,
      permissions,
      color
    };

    res.json({
      success: true,
      message: 'Role berhasil diupdate',
      role: updatedRole
    });
  } catch (error) {
    next(error);
  }
};

// Delete role
export const deleteRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: _id } = req.params;

    // Check if role is in use
    // In real app, check database for users with this role
    
    res.json({
      success: true,
      message: 'Role berhasil dihapus'
    });
  } catch (error) {
    next(error);
  }
};

// Test email configuration
export const testEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    const emailSent = await emailService.sendTestEmail(email);

    if (emailSent) {
      res.json({
        success: true,
        message: `Test email sent successfully to ${email}`
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email. Check email configuration.'
      });
    }
  } catch (error) {
    console.error('Test email error:', error);
    next(error);
  }
};

// Manual trigger for expiring document notifications
export const triggerExpiryNotifications = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Trigger the notification check manually
    await notificationScheduler.triggerManualCheck();

    res.json({
      success: true,
      message: 'Document expiry notification check triggered successfully'
    });
  } catch (error) {
    console.error('Trigger notification error:', error);
    next(error);
  }
};
