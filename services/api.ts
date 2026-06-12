import type { SourceService, ConnectionParams, TestResult } from './types.ts';
import { logger } from './logger.ts';

export const apiService: SourceService = {
  type: ['canvas', 'blackboard', 'moodle', 'banner', 'ellucian', 'custom-api'],

  async testConnection(params: ConnectionParams): Promise<TestResult> {
    const { apiUrl, apiKey } = params;
    const startTime = Date.now();

    try {
      if (!apiUrl) throw new Error('API URL is required');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey || ''}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const dur = Date.now() - startTime;
      if (response.ok || response.status < 500) {
        logger.logConnectionTest('api', 'success', dur, { metadata: { url: apiUrl, statusCode: response.status } });
        return { success: true, latency: dur, statusCode: response.status };
      } else {
        logger.logConnectionTest('api', 'failure', dur, { error: `API returned status ${response.status}`, metadata: { url: apiUrl, statusCode: response.status } });
        return { success: false, error: `API returned status ${response.status}`, latency: dur };
      }
    } catch (error: any) {
      const dur = Date.now() - startTime;
      logger.logConnectionTest('api', 'failure', dur, { error: error.message, metadata: { url: apiUrl } });
      return { success: false, error: `API request failed: ${error.message}`, latency: dur };
    }
  }
};
