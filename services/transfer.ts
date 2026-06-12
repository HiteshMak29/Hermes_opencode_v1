import type { SourceService, ConnectionParams, TestResult } from './types.ts';
import { logger } from './logger.ts';

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
      const list = await client.list(targetPath);
      await client.end();
      const dur = Date.now() - startTime;
      logger.logConnectionTest('sftp', 'success', dur, { metadata: { host: dbHost, port: dbPort, path: targetPath, entries: list.length } });
      return { success: true, latency: dur };
    } catch (error: any) {
      const dur = Date.now() - startTime;
      logger.logConnectionTest('sftp', 'failure', dur, { error: error.message, metadata: { host: dbHost, port: dbPort } });
      return { success: false, error: `SFTP connection failed: ${error.message}`, latency: dur };
    }
  }
};
