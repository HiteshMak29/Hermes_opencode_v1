import { registerService, getService } from './registry.ts';
import { rdbmsService } from './rdbms.ts';
import { directoryService } from './directory.ts';
import { messagingService } from './messaging.ts';
import { transferService } from './transfer.ts';
import { storageService } from './storage.ts';
import { apiService } from './api.ts';
import type { ConnectionParams, TestResult, QueryResult } from './types.ts';
import { resolveType } from './types.ts';
import { logger } from './logger.ts';

registerService(rdbmsService);
registerService(directoryService);
registerService(messagingService);
registerService(transferService);
registerService(storageService);
registerService(apiService);

logger.logSystemEvent('gateway-init', 'All microservices registered and gateway ready');

export async function testConnection(params: ConnectionParams): Promise<TestResult> {
  const type = resolveType(params);
  if (!type) {
    logger.warn('gateway', 'test-connection', 'Missing source type in request');
    return { success: false, error: 'Missing source type' };
  }

  const service = getService(type);
  if (!service) {
    logger.warn('gateway', 'test-connection', `Unsupported source type: '${type}'`, { metadata: { sourceType: type } });
    return { success: false, error: `Unsupported source type: '${type}'` };
  }

  logger.info('gateway', 'route', `Routing test-connection to ${type} service`, { metadata: { sourceType: type } });
  return service.testConnection(params);
}

export async function executeQuery(connection: ConnectionParams, sqlQuery: string): Promise<QueryResult> {
  const type = connection.dbType || connection.sourceType || '';
  logger.info('gateway', 'route', `Routing execute-query to ${type} service`, { metadata: { dbType: type, sqlPreview: sqlQuery?.slice(0, 80) } });

  const service = getService(type);

  if (!service || !service.executeQuery) {
    logger.warn('gateway', 'execute-query', `No query executor for type '${type}'`, { metadata: { dbType: type } });
    return {
      success: false,
      error: `Database platform '${type}' is not currently configured for executing card telemetry.`
    };
  }

  return service.executeQuery(connection, sqlQuery);
}
