import { appendFile, mkdir, access } from 'fs/promises';
import { join } from 'path';

const LOG_DIR = join(process.cwd(), 'logs');
const MAX_MEM_ENTRIES = 5000;

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogStatus = 'success' | 'failure' | 'pending';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  action: string;
  message: string;
  status: LogStatus;
  session?: string;
  userId?: string;
  duration?: number;
  ip?: string;
  userAgent?: string;
  correlationId?: string;
  payloadBytes?: number;
  metadata?: Record<string, unknown>;
  error?: { message: string; code?: string; stack?: string };
}

class Logger {
  private memBuffer: LogEntry[] = [];
  private ready = false;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    try {
      await access(LOG_DIR);
    } catch {
      await mkdir(LOG_DIR, { recursive: true });
    }
    this.ready = true;
  }

  private get today(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private logFilePath(): string {
    return join(LOG_DIR, `app-${this.today}.log`);
  }

  private async writeToFile(entry: LogEntry): Promise<void> {
    try {
      const line = JSON.stringify(entry) + '\n';
      await appendFile(this.logFilePath(), line, 'utf-8');
    } catch {
      // fail silent
    }
  }

  private push(entry: LogEntry): void {
    this.memBuffer.push(entry);
    if (this.memBuffer.length > MAX_MEM_ENTRIES) {
      this.memBuffer.shift();
    }
  }

  log(level: LogLevel, module: string, action: string, message: string, opts?: {
    status?: LogStatus;
    session?: string;
    userId?: string;
    duration?: number;
    ip?: string;
    userAgent?: string;
    correlationId?: string;
    payloadBytes?: number;
    metadata?: Record<string, unknown>;
    error?: { message: string; code?: string; stack?: string };
  }): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module,
      action,
      message,
      status: opts?.status ?? (level === 'error' ? 'failure' : 'success'),
      ...(opts?.session ? { session: opts.session } : {}),
      ...(opts?.userId ? { userId: opts.userId } : {}),
      ...(opts?.duration !== undefined ? { duration: Math.round(opts.duration) } : {}),
      ...(opts?.ip ? { ip: opts.ip } : {}),
      ...(opts?.userAgent ? { userAgent: opts.userAgent } : {}),
      ...(opts?.correlationId ? { correlationId: opts.correlationId } : {}),
      ...(opts?.payloadBytes !== undefined ? { payloadBytes: opts.payloadBytes } : {}),
      ...(opts?.metadata ? { metadata: opts.metadata } : {}),
      ...(opts?.error ? { error: opts.error } : {}),
    };

    this.push(entry);
    if (this.ready) {
      this.writeToFile(entry);
    }
  }

  info(module: string, action: string, message: string, opts?: Omit<Parameters<Logger['log']>[4], 'error'> & { error?: { message: string; code?: string } }): void {
    this.log('info', module, action, message, opts);
  }
  warn(module: string, action: string, message: string, opts?: Omit<Parameters<Logger['log']>[4], 'error'> & { error?: { message: string; code?: string } }): void {
    this.log('warn', module, action, message, opts);
  }
  error(module: string, action: string, message: string, opts?: Omit<Parameters<Logger['log']>[4], 'error'> & { error?: { message: string; code?: string; stack?: string } }): void {
    this.log('error', module, action, message, opts);
  }
  debug(module: string, action: string, message: string, opts?: Omit<Parameters<Logger['log']>[4], 'error'> & { error?: { message: string; code?: string } }): void {
    this.log('debug', module, action, message, opts);
  }

  // ── specialised helpers ──

  logConnectionTest(sourceType: string, status: LogStatus, duration: number, opts?: { error?: string; metadata?: Record<string, unknown> }): void {
    this.log(status === 'success' ? 'info' : 'error', 'connectivity', 'test-connection',
      `${sourceType} connection test ${status} in ${duration}ms`, {
      status, duration, metadata: { sourceType, ...opts?.metadata },
      ...(opts?.error ? { error: { message: opts.error } } : {}),
    });
  }

  logQueryExecution(dbType: string, status: LogStatus, duration: number, opts?: { error?: string; sql?: string; metadata?: Record<string, unknown> }): void {
    this.log(status === 'success' ? 'info' : 'error', 'database', 'execute-query',
      `${dbType} query ${status} in ${duration}ms`, {
      status, duration, metadata: { dbType, sqlPreview: opts?.sql?.slice(0, 120), ...opts?.metadata },
      ...(opts?.error ? { error: { message: opts.error } } : {}),
    });
  }

  logAuthEvent(action: string, status: LogStatus, opts?: { userId?: string; session?: string; ip?: string; error?: string }): void {
    this.log(status === 'success' ? 'info' : 'warn', 'auth', action, `Auth ${action} ${status}`, {
      status, userId: opts?.userId, session: opts?.session, ip: opts?.ip,
      ...(opts?.error ? { error: { message: opts.error } } : {}),
    });
  }

  logSystemEvent(action: string, message: string, opts?: { metadata?: Record<string, unknown> }): void {
    this.log('info', 'system', action, message, { status: 'success', ...opts });
  }

  logModuleAccess(module: string, userId: string, session: string, action: string, status: LogStatus, opts?: { ip?: string; duration?: number }): void {
    this.log('info', 'module-access', action,
      `User ${userId} ${action} module ${module}`, {
      status, userId, session, ip: opts?.ip, duration: opts?.duration, metadata: { module },
    });
  }

  logPageView(page: string, userId: string, session: string, duration: number, opts?: { ip?: string }): void {
    this.log('info', 'frontend', 'page-view',
      `Page view: ${page} (${duration}ms)`, {
      status: 'success', userId, session, duration, ip: opts?.ip, metadata: { page },
    });
  }

  logTransaction(type: string, status: LogStatus, duration: number, opts?: {
    correlationId?: string; userId?: string; session?: string; error?: string; payloadBytes?: number; metadata?: Record<string, unknown>
  }): void {
    this.log(status === 'success' ? 'info' : 'error', 'transaction', type,
      `Transaction ${type} ${status} in ${duration}ms`, {
      status, duration, correlationId: opts?.correlationId, userId: opts?.userId,
      session: opts?.session, payloadBytes: opts?.payloadBytes,
      ...(opts?.error ? { error: { message: opts.error } } : {}),
      metadata: opts?.metadata,
    });
  }

  logPerformance(module: string, metric: string, value: number, opts?: { metadata?: Record<string, unknown> }): void {
    this.log('info', 'performance', metric,
      `${module} ${metric}: ${value}`, {
      status: 'success', duration: value, metadata: { module, ...opts?.metadata },
    });
  }

  // ── query / retrieval ──

  recent(limit = 200): LogEntry[] {
    return this.memBuffer.slice(-limit);
  }

  search(filters: {
    modules?: string[];
    levels?: LogLevel[];
    status?: LogStatus;
    from?: string;
    to?: string;
    limit?: number;
    correlationId?: string;
  }): LogEntry[] {
    let results = [...this.memBuffer];

    if (filters.modules?.length) results = results.filter(e => filters.modules!.includes(e.module));
    if (filters.levels?.length) results = results.filter(e => filters.levels!.includes(e.level));
    if (filters.status) results = results.filter(e => e.status === filters.status);
    if (filters.correlationId) results = results.filter(e => e.correlationId === filters.correlationId);
    if (filters.from) { const f = new Date(filters.from).getTime(); results = results.filter(e => new Date(e.timestamp).getTime() >= f); }
    if (filters.to) { const t = new Date(filters.to).getTime(); results = results.filter(e => new Date(e.timestamp).getTime() <= t); }

    return results.slice(-(filters.limit ?? 200));
  }

  stats(): {
    total: number;
    byLevel: Record<string, number>;
    byModule: Record<string, number>;
    byStatus: Record<string, number>;
    byAction: Record<string, number>;
    failureRate: number;
    avgDuration: number;
    p50Duration: number;
    p95Duration: number;
    p99Duration: number;
    topErrors: { module: string; action: string; count: number }[];
    topSlowActions: { module: string; action: string; avgDuration: number; count: number }[];
    throughput: { timestamp: string; count: number }[];
    hourlyBreakdown: { hour: string; count: number; errors: number }[];
    moduleAccessCount: { module: string; count: number }[];
    pageViews: { page: string; count: number; avgDuration: number }[];
    dataThroughput: number;
    successRate: number;
  } {
    const entries = this.memBuffer;
    const byLevel: Record<string, number> = {};
    const byModule: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byAction: Record<string, number> = {};
    const errors: Record<string, { module: string; action: string; count: number }> = {};
    const durations: number[] = [];
    const moduleAccess: Record<string, number> = {};
    const pageViewsMap: Record<string, { count: number; totalDuration: number }> = {};
    let totalPayload = 0;

    for (const e of entries) {
      byLevel[e.level] = (byLevel[e.level] || 0) + 1;
      byModule[e.module] = (byModule[e.module] || 0) + 1;
      byStatus[e.status] = (byStatus[e.status] || 0) + 1;
      const actionKey = `${e.module}:${e.action}`;
      byAction[actionKey] = (byAction[actionKey] || 0) + 1;

      if (e.duration !== undefined) durations.push(e.duration);
      if (e.payloadBytes !== undefined) totalPayload += e.payloadBytes;

      if (e.level === 'error' && e.error) {
        const key = `${e.module}:${e.action}`;
        if (!errors[key]) errors[key] = { module: e.module, action: e.action, count: 0 };
        errors[key].count++;
      }

      if (e.module === 'module-access' && e.metadata?.module) {
        moduleAccess[e.metadata.module as string] = (moduleAccess[e.metadata.module as string] || 0) + 1;
      }

      if (e.action === 'page-view' && e.metadata?.page) {
        const page = e.metadata.page as string;
        if (!pageViewsMap[page]) pageViewsMap[page] = { count: 0, totalDuration: 0 };
        pageViewsMap[page].count++;
        pageViewsMap[page].totalDuration += e.duration || 0;
      }
    }

    // percentiles
    const sorted = [...durations].sort((a, b) => a - b);
    const p = (n: number) => {
      if (sorted.length === 0) return 0;
      const idx = Math.ceil(n / 100 * sorted.length) - 1;
      return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
    };

    // throughput per minute (last 10)
    const now = Date.now();
    const throughput: { timestamp: string; count: number }[] = [];
    for (let i = 9; i >= 0; i--) {
      const start = now - (i + 1) * 60000;
      const end = now - i * 60000;
      const count = entries.filter(e => {
        const t = new Date(e.timestamp).getTime();
        return t >= start && t < end;
      }).length;
      throughput.push({ timestamp: new Date(start + 30000).toISOString().slice(11, 19), count });
    }

    // hourly breakdown last 24h
    const hourly: Record<string, { count: number; errors: number }> = {};
    for (const e of entries) {
      const hour = e.timestamp.slice(11, 13);
      if (!hourly[hour]) hourly[hour] = { count: 0, errors: 0 };
      hourly[hour].count++;
      if (e.level === 'error') hourly[hour].errors++;
    }
    const hourlyBreakdown = Object.entries(hourly).map(([hour, v]) => ({ hour: `${hour}:00`, count: v.count, errors: v.errors }));

    // top slowest actions (by avg duration, min 3 samples)
    const actionDurations: Record<string, { total: number; count: number }> = {};
    for (const e of entries) {
      if (e.duration === undefined) continue;
      const key = `${e.module}:${e.action}`;
      if (!actionDurations[key]) actionDurations[key] = { total: 0, count: 0 };
      actionDurations[key].total += e.duration;
      actionDurations[key].count++;
    }
    const topSlowActions = Object.entries(actionDurations)
      .filter(([_, v]) => v.count >= 3)
      .map(([key, v]) => {
        const [module, action] = key.split(':');
        return { module, action, avgDuration: Math.round(v.total / v.count), count: v.count };
      })
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 10);

    const moduleAccessCount = Object.entries(moduleAccess)
      .map(([module, count]) => ({ module, count }))
      .sort((a, b) => b.count - a.count);

    const pageViews = Object.entries(pageViewsMap)
      .map(([page, v]) => ({ page, count: v.count, avgDuration: v.count > 0 ? Math.round(v.totalDuration / v.count) : 0 }))
      .sort((a, b) => b.count - a.count);

    const total = entries.length;
    const failures = byStatus['failure'] || 0;

    return {
      total,
      byLevel,
      byModule,
      byStatus,
      byAction,
      failureRate: total > 0 ? Math.round((failures / total) * 10000) / 100 : 0,
      successRate: total > 0 ? Math.round(((total - failures) / total) * 10000) / 100 : 100,
      avgDuration: durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0,
      p50Duration: p(50),
      p95Duration: p(95),
      p99Duration: p(99),
      topErrors: Object.values(errors).sort((a, b) => b.count - a.count).slice(0, 10),
      topSlowActions,
      throughput,
      hourlyBreakdown,
      moduleAccessCount,
      pageViews,
      dataThroughput: totalPayload,
    };
  }
}

export const logger = new Logger();
