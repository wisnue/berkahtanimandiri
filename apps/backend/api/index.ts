/**
 * Vercel Serverless Function Entry Point
 * File ini digunakan saat backend di-deploy ke Vercel
 *
 * Vercel akan menjalankan Express app sebagai serverless function,
 * bukan sebagai server yang "always running" seperti di Render.
 *
 * Catatan penting:
 * - Tidak ada `app.listen()` di sini — Vercel yang handle itu
 * - Scheduler (cron, backup) tidak aktif di mode serverless
 * - File upload disimpan di /tmp (terhapus setelah request selesai)
 */

import app from '../src/app.js';

export default app;
