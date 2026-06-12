import type { SourceService, ConnectionParams, TestResult } from './types.ts';

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
      if (response.ok || response.status < 500) {
        return { success: true, latency: Date.now() - startTime, statusCode: response.status };
      } else {
        return { success: false, error: `API returned status ${response.status}`, latency: Date.now() - startTime };
      }
    } catch (error: any) {
      return { success: false, error: `API request failed: ${error.message}`, latency: Date.now() - startTime };
    }
  }
};
