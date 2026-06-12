import type { SourceService, ConnectionParams, TestResult } from './types.ts';
import { logger } from './logger.ts';

export const directoryService: SourceService = {
  type: 'active-directory',

  async testConnection(params: ConnectionParams): Promise<TestResult> {
    const { dbUser, dbPass, dbSslMode, domain, dbHost, dbPort, baseDn } = params;
    const startTime = Date.now();
    let ldap: any;

    try {
      ldap = await import('ldapjs');
      const client = ldap.createClient({
        url: `ldap${dbSslMode === 'require' || dbSslMode === 'prefer' ? 's' : ''}://${domain || dbHost}:${parseInt(dbPort || '389')}`,
        timeout: 5000,
        connectTimeout: 5000,
        tlsOptions: dbSslMode === 'require' || dbSslMode === 'prefer' ? { rejectUnauthorized: false } : undefined,
      });
      await new Promise<void>((resolve, reject) => {
        client.bind(dbUser, dbPass, (err: any) => {
          client.unbind();
          if (err) reject(new Error(err.message || 'LDAP bind failed'));
          else resolve();
        });
      });
      const dur = Date.now() - startTime;
      logger.logConnectionTest('active-directory', 'success', dur, { metadata: { domain: domain || dbHost, baseDn } });
      return { success: true, latency: dur };
    } catch (error: any) {
      const dur = Date.now() - startTime;
      logger.logConnectionTest('active-directory', 'failure', dur, { error: error.message, metadata: { domain: domain || dbHost } });
      return { success: false, error: `LDAP connection failed: ${error.message}`, latency: dur };
    }
  }
};
