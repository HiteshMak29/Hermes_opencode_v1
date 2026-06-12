import type { SourceService, ConnectionParams, TestResult } from './types.ts';

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
      return { success: true, latency: Date.now() - startTime };
    } catch (error: any) {
      return { success: false, error: `LDAP connection failed: ${error.message}`, latency: Date.now() - startTime };
    }
  }
};
