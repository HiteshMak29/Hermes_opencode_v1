import type { SourceService, ConnectionParams, TestResult } from './types.ts';

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
      return { success: true, latency: Date.now() - startTime };
    } catch (error: any) {
      return { success: false, error: `Local file system access failed: ${error.message}`, latency: Date.now() - startTime };
    }
  }
};
