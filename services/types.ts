export interface ConnectionParams {
  sourceType?: string;
  dbType?: string;
  dbHost?: string;
  dbPort?: string;
  dbName?: string;
  dbUser?: string;
  dbPass?: string;
  dbSslMode?: string;
  domain?: string;
  baseDn?: string;
  basePath?: string;
  apiUrl?: string;
  apiKey?: string;
  apiPlatform?: string;
}

export interface TestResult {
  success: boolean;
  latency?: number;
  error?: string;
  statusCode?: number;
}

export interface QueryResult {
  success: boolean;
  rows?: any[];
  columns?: string[];
  error?: string;
  code?: string;
}

export interface SourceService {
  readonly type: string | string[];
  testConnection(params: ConnectionParams): Promise<TestResult>;
  executeQuery?(connection: ConnectionParams, sqlQuery: string): Promise<QueryResult>;
}

export function resolveType(params: ConnectionParams): string {
  return params.sourceType || params.dbType || '';
}
