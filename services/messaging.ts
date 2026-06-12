import type { SourceService, ConnectionParams, TestResult } from './types.ts';

export const messagingService: SourceService = {
  type: 'smtp',

  async testConnection(params: ConnectionParams): Promise<TestResult> {
    const { dbHost, dbPort, dbUser, dbPass, dbSslMode } = params;
    const startTime = Date.now();

    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: dbHost,
        port: parseInt(dbPort || '587'),
        secure: dbSslMode === 'require' ? (parseInt(dbPort || '587') === 465) : false,
        auth: { user: dbUser, pass: dbPass },
        tls: dbSslMode === 'require' ? { rejectUnauthorized: false } : undefined,
        connectionTimeout: 5000,
      });
      await transporter.verify();
      return { success: true, latency: Date.now() - startTime };
    } catch (error: any) {
      return { success: false, error: `SMTP connection failed: ${error.message}`, latency: Date.now() - startTime };
    }
  }
};
