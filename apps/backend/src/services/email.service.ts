import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { env } from '../config/env';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Check if email configuration is available
    if (!env.EMAIL_HOST || !env.EMAIL_USER || !env.EMAIL_PASS) {
      console.warn('Email configuration not found. Email notifications will be disabled.');
      return;
    }

    try {
      const transportOptions: SMTPTransport.Options = {
        host: env.EMAIL_HOST,
        port: Number(env.EMAIL_PORT) || 587,
        secure: env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: env.EMAIL_USER,
          pass: env.EMAIL_PASS,
        },
      };
      
      this.transporter = nodemailer.createTransport(transportOptions);

      console.log('✅ Email service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.warn('Email transporter not available. Skipping email send.');
      return false;
    }

    try {
      const mailOptions = {
        from: options.from || `"KTH Bumi Tirtamas Mandiri" <${env.EMAIL_FROM || env.EMAIL_USER}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send notification for documents expiring soon
   */
  async sendExpiringDocumentNotification(
    recipients: string[],
    expiringDocs: Array<{
      judulDokumen: string;
      jenisDokumen: string;
      tanggalKadaluarsa: string;
      daysUntilExpiry: number;
    }>
  ): Promise<boolean> {
    const docList = expiringDocs
      .map(
        (doc) =>
          `<tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${doc.judulDokumen}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${this.getJenisDokumenLabel(doc.jenisDokumen)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date(doc.tanggalKadaluarsa).toLocaleDateString('id-ID')}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: ${doc.daysUntilExpiry <= 7 ? 'red' : 'orange'}; font-weight: bold;">
              ${doc.daysUntilExpiry} hari
            </td>
          </tr>`
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; background-color: white; }
          th { background-color: #f3f4f6; padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #d1d5db; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          .btn { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">⚠️ Peringatan Dokumen Kadaluarsa</h2>
            <p style="margin: 5px 0 0 0;">KTH Bumi Tirtamas Mandiri</p>
          </div>
          
          <div class="content">
            <div class="warning">
              <strong>⚠️ Perhatian!</strong><br>
              Terdapat <strong>${expiringDocs.length} dokumen organisasi</strong> yang akan segera kadaluarsa.
            </div>

            <p>Berikut adalah daftar dokumen yang memerlukan perhatian Anda:</p>

            <table>
              <thead>
                <tr>
                  <th>Judul Dokumen</th>
                  <th>Jenis</th>
                  <th>Tanggal Kadaluarsa</th>
                  <th>Sisa Waktu</th>
                </tr>
              </thead>
              <tbody>
                ${docList}
              </tbody>
            </table>

            <div style="margin: 20px 0; padding: 15px; background-color: white; border-radius: 6px;">
              <h3 style="margin-top: 0; color: #1f2937;">Tindakan yang Diperlukan:</h3>
              <ul style="margin: 10px 0;">
                <li>Segera perbarui dokumen yang akan kadaluarsa</li>
                <li>Upload versi terbaru melalui sistem</li>
                <li>Koordinasi dengan pihak terkait untuk penerbitan dokumen baru</li>
                <li>Pastikan compliance audit tetap terjaga</li>
              </ul>
            </div>

            <div style="text-align: center;">
              <a href="${env.APP_URL || 'http://localhost:5173'}/dokumen-organisasi" class="btn">
                Lihat Dokumen Organisasi
              </a>
            </div>
          </div>

          <div class="footer">
            <p>Email ini dikirim secara otomatis oleh sistem KTH Bumi Tirtamas Mandiri</p>
            <p>Untuk informasi lebih lanjut, hubungi administrator sistem</p>
            <p style="margin-top: 10px;">
              &copy; ${new Date().getFullYear()} KTH Bumi Tirtamas Mandiri. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: recipients,
      subject: `⚠️ Peringatan: ${expiringDocs.length} Dokumen Akan Kadaluarsa`,
      html,
    });
  }

  private getJenisDokumenLabel(jenis: string): string {
    const labels: Record<string, string> = {
      sk_pembentukan: 'SK Pembentukan KTH',
      ad_art: 'AD/ART',
      sk_pengurus: 'SK Pengurus',
      sk_khdpk: 'SK KHDPK',
      sk_perhutanan_sosial: 'SK Perhutanan Sosial',
      rekomendasi_dinas: 'Rekomendasi Dinas',
      nib: 'NIB',
      npwp_organisasi: 'NPWP Organisasi',
      sertifikat_lahan: 'Sertifikat Lahan',
      mou_kerjasama: 'MoU/PKS',
      lainnya: 'Lainnya',
    };
    return labels[jenis] || jenis;
  }

  /**
   * Send test email to verify configuration
   */
  async sendTestEmail(to: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #3b82f6;">✅ Email Configuration Test</h2>
        <p>This is a test email from KTH Bumi Tirtamas Mandiri system.</p>
        <p>If you receive this, your email configuration is working correctly!</p>
        <hr>
        <p style="color: #6b7280; font-size: 12px;">
          Sent at: ${new Date().toLocaleString('id-ID')}<br>
          System: KTH Management System
        </p>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: '✅ Test Email - KTH System',
      html,
    });
  }
}

export const emailService = new EmailService();
