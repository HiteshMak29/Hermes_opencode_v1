import type { SourceService, ConnectionParams, TestResult } from './types.ts';

export const transferService: SourceService = {
  type: 'sftp',

  async testConnection(params: ConnectionParams): Promise<TestResult> {
    const { dbHost, dbPort, dbUser, dbPass, basePath } = params;
    const startTime = Date.now();

    try {
      const SftpClient = (await import('ssh2-sftp-client'));
      const client = new SftpClient();
      await client.connect({
        host: dbHost,
        port: parseInt(dbPort || '22'),
        username: dbUser,
        password: dbPass,
        readyTimeout: 10000,
      });
      const targetPath = basePath || '/';
      await client.list(targetPath);
      await client.end();
      return { success: true, latency: Date.now() - startTime };
    } catch (error: any) {
      return { success: false, error: `SFTP connection failed: ${error.message}`, latency: Date.now() - startTime };
    }
  }
};
