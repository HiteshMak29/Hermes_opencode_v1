import pg from "pg";
import mssql from "mssql";
import type { SourceService, ConnectionParams, TestResult, QueryResult } from './types.ts';
import { resolveType } from './types.ts';
import { logger } from './logger.ts';

export const rdbmsService: SourceService = {
  type: ['postgresql', 'postgres', 'sqlserver', 'mssql', 'mysql', 'oracle', 'sqlite'],

  async testConnection(params: ConnectionParams): Promise<TestResult> {
    const { dbHost, dbPort, dbName, dbUser, dbPass, dbSslMode } = params;
    const actualType = resolveType(params);
    const startTime = Date.now();

    if (actualType === "sqlserver" || actualType === "mssql") {
      try {
        const config = {
          user: dbUser,
          password: dbPass,
          server: dbHost!,
          port: parseInt(dbPort || '1433'),
          database: dbName || 'master',
          options: {
            encrypt: dbSslMode === "require" || dbSslMode === "prefer",
            trustServerCertificate: true
          },
          connectionTimeout: 5000,
          requestTimeout: 5000
        };
        const pool = await mssql.connect(config);
        await pool.request().query('SELECT 1');
        await pool.close();
        const dur = Date.now() - startTime;
        logger.logConnectionTest(actualType, 'success', dur, { metadata: { dbHost, dbPort, dbName } });
        return { success: true, latency: dur };
      } catch (error: any) {
        const dur = Date.now() - startTime;
        logger.logConnectionTest(actualType, 'failure', dur, { error: error.message, metadata: { dbHost, dbPort, dbName } });
        return { success: false, error: error.message, latency: dur };
      }
    }

    if (actualType === "postgresql" || actualType === "postgres") {
      try {
        const poolConfig: pg.PoolConfig = {
          user: dbUser,
          host: dbHost,
          database: dbName || 'postgres',
          password: dbPass,
          port: parseInt(dbPort || '5432'),
          connectionTimeoutMillis: 5000
        };
        if (dbSslMode === "require" || dbSslMode === "prefer") {
          poolConfig.ssl = { rejectUnauthorized: false };
        }
        const client = new pg.Client(poolConfig);
        await client.connect();
        await client.query('SELECT 1');
        await client.end();
        const dur = Date.now() - startTime;
        logger.logConnectionTest(actualType, 'success', dur, { metadata: { dbHost, dbPort, dbName } });
        return { success: true, latency: dur };
      } catch (error: any) {
        const dur = Date.now() - startTime;
        logger.logConnectionTest(actualType, 'failure', dur, { error: error.message, metadata: { dbHost, dbPort, dbName } });
        return { success: false, error: error.message, latency: dur };
      }
    }

    const dur = Date.now() - startTime;
    logger.warn('rdbms', 'test-connection', `Unsupported RDBMS type: ${actualType}`);
    return { success: false, error: `RDBMS type '${actualType}' not implemented for testing` };
  },

  async executeQuery(connection: ConnectionParams, sqlQuery: string): Promise<QueryResult> {
    const { dbHost, dbPort, dbName, dbUser, dbPass, dbSslMode } = connection;
    const dbType = connection.dbType || 'postgresql';
    const startTime = Date.now();

    let processedQuery = sqlQuery;
    processedQuery = processedQuery.replace(/@StudentId/gi, "'1028617'");
    processedQuery = processedQuery.replace(/:student_id/gi, "'1028617'");

    if (dbType === "sqlserver" || dbType === "mssql") {
      try {
        const config = {
          user: dbUser,
          password: dbPass,
          server: dbHost!,
          port: parseInt(dbPort || '1433'),
          database: dbName,
          options: {
            encrypt: dbSslMode === "require" || dbSslMode === "prefer",
            trustServerCertificate: true
          },
          connectionTimeout: 4000,
          requestTimeout: 8000
        };
        const pool = await mssql.connect(config);
        const result = await pool.request().query(processedQuery);
        await pool.close();
        const dur = Date.now() - startTime;
        logger.logQueryExecution(dbType, 'success', dur, { sql: sqlQuery, metadata: { dbHost, rowCount: result.recordset?.length } });
        return {
          success: true,
          rows: result.recordset,
          columns: result.recordset && result.recordset.length > 0 ? Object.keys(result.recordset[0]) : []
        };
      } catch (error: any) {
        const dur = Date.now() - startTime;
        logger.logQueryExecution(dbType, 'failure', dur, { error: error.message, sql: sqlQuery });
        return {
          success: false,
          error: error.message || "Failed to query MSSQL Server backend",
          code: error.code || "DB_ERROR"
        };
      }
    }

    if (dbType === "postgresql" || dbType === "postgres") {
      try {
        const poolConfig: pg.PoolConfig = {
          user: dbUser,
          host: dbHost,
          database: dbName,
          password: dbPass,
          port: parseInt(dbPort || '5432'),
          connectionTimeoutMillis: 4000
        };
        if (dbSslMode === "require" || dbSslMode === "prefer") {
          poolConfig.ssl = { rejectUnauthorized: false };
        }
        const client = new pg.Client(poolConfig);
        await client.connect();
        const result = await client.query({ text: processedQuery, rowMode: 'array' as any });
        await client.end();

        const cols = result.fields.map(f => f.name);
        const rows = result.rows.map(row => {
          const obj: any = {};
          cols.forEach((colName, index) => {
            obj[colName] = (row as any)[index];
          });
          return obj;
        });
        const dur = Date.now() - startTime;
        logger.logQueryExecution(dbType, 'success', dur, { sql: sqlQuery, metadata: { dbHost, rowCount: rows.length } });
        return { success: true, rows, columns: cols };
      } catch (error: any) {
        const dur = Date.now() - startTime;
        logger.logQueryExecution(dbType, 'failure', dur, { error: error.message, sql: sqlQuery });
        return {
          success: false,
          error: error.message || "Failed to query PostgreSQL backend",
          code: error.code || "DB_ERROR"
        };
      }
    }

    const dur = Date.now() - startTime;
    logger.warn('rdbms', 'execute-query', `Unsupported RDBMS type for query: ${dbType}`);
    return {
      success: false,
      error: `Database platform '${dbType}' is not currently configured for executing card telemetry.`
    };
  }
};
