import { registerService, getService } from './registry.ts';
import { rdbmsService } from './rdbms.ts';
import { directoryService } from './directory.ts';
import { messagingService } from './messaging.ts';
import { transferService } from './transfer.ts';
import { storageService } from './storage.ts';
import { apiService } from './api.ts';
import type { ConnectionParams, TestResult, QueryResult } from './types.ts';
import { resolveType } from './types.ts';

registerService(rdbmsService);
registerService(directoryService);
registerService(messagingService);
registerService(transferService);
registerService(storageService);
registerService(apiService);

export async function testConnection(params: ConnectionParams): Promise<TestResult> {
  const type = resolveType(params);
  if (!type) {
    return { success: false, error: 'Missing source type' };
  }

  const service = getService(type);
  if (!service) {
    return { success: false, error: `Unsupported source type: '${type}'` };
  }

  return service.testConnection(params);
}

export async function executeQuery(connection: ConnectionParams, sqlQuery: string): Promise<QueryResult> {
  const type = connection.dbType || connection.sourceType || '';
  const service = getService(type);

  if (!service || !service.executeQuery) {
    return {
      success: false,
      error: `Database platform '${type}' is not currently configured for executing card telemetry.`
    };
  }

  return service.executeQuery(connection, sqlQuery);
}
