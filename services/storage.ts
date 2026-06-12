import type { SourceService, ConnectionParams, TestResult } from './types.ts';
import { logger } from './logger.ts';

export const storageService: SourceService = {
  type: 'local-files',

  async testConnection(params: ConnectionParams): Promise<TestResult> {
    const { basePath } = params;
    const startTime = Date.now();

    try {
      const fs = await import('fs/promises');
      const targetPath = basePath || '.';
      await fs.access(targetPath);
      const stat = await fs.stat(targetPath);
      if (!stat.isDirectory()) throw new Error('Path is not a directory');
      const dur = Date.now() - startTime;
      logger.logConnectionTest('local-files', 'success', dur, { metadata: { path: targetPath } });
      return { success: true, latency: dur };
    } catch (error: any) {
      const dur = Date.now() - startTime;
      logger.logConnectionTest('local-files', 'failure', dur, { error: error.message, metadata: { path: basePath || '.' } });
      return { success: false, error: `Local file system access failed: ${error.message}`, latency: dur };
    }
  }
};
