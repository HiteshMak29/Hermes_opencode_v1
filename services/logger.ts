import { appendFile, mkdir, access } from 'fs/promises';
import { join } from 'path';

const LOG_DIR = join(process.cwd(), 'logs');
const MAX_MEM_ENTRIES = 2000;

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
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return ds;
  }

  private logFilePath(): string {
    return join(LOG_DIR, `app-${this.today}.log`);
  }

  private async writeToFile(entry: LogEntry): Promise<void> {
    try {
      const line = JSON.stringify(entry) + '\n';
      await appendFile(this.logFilePath(), line, 'utf-8');
    } catch {
      // fail silent — can't log the logger failure
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
      ...(opts?.metadata ? { metadata: opts.metadata } : {}),
      ...(opts?.error ? { error: opts.error } : {}),
    };

    this.push(entry);

    if (this.ready) {
      this.writeToFile(entry);
    }
  }

  // ── convenience helpers ──

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
    this.log(status === 'success' ? 'info' : 'warn', 'auth', action,
      `Auth ${action} ${status}`, {
      status, userId: opts?.userId, session: opts?.session, ip: opts?.ip,
      ...(opts?.error ? { error: { message: opts.error } } : {}),
    });
  }

  logSystemEvent(action: string, message: string, opts?: { metadata?: Record<string, unknown> }): void {
    this.log('info', 'system', action, message, { status: 'success', ...opts });
  }

  logModuleAccess(module: string, userId: string, session: string, action: string, status: LogStatus, opts?: { ip?: string }): void {
    this.log('info', 'module-access', action,
      `User ${userId} ${action} module ${module}`, {
      status, userId, session, ip: opts?.ip, metadata: { module },
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
  }): LogEntry[] {
    let results = [...this.memBuffer];

    if (filters.modules?.length) {
      results = results.filter(e => filters.modules!.includes(e.module));
    }
    if (filters.levels?.length) {
      results = results.filter(e => filters.levels!.includes(e.level));
    }
    if (filters.status) {
      results = results.filter(e => e.status === filters.status);
    }
    if (filters.from) {
      const from = new Date(filters.from).getTime();
      results = results.filter(e => new Date(e.timestamp).getTime() >= from);
    }
    if (filters.to) {
      const to = new Date(filters.to).getTime();
      results = results.filter(e => new Date(e.timestamp).getTime() <= to);
    }

    return results.slice(- (filters.limit ?? 200));
  }

  stats(): {
    total: number;
    byLevel: Record<string, number>;
    byModule: Record<string, number>;
    byStatus: Record<string, number>;
    failureRate: number;
    avgDuration: number;
    topErrors: { module: string; action: string; count: number }[];
    throughput: { timestamp: string; count: number }[];
  } {
    const entries = this.memBuffer;
    const byLevel: Record<string, number> = {};
    const byModule: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const errors: Record<string, { module: string; action: string; count: number }> = {};
    let totalDuration = 0;
    let durationCount = 0;

    for (const e of entries) {
      byLevel[e.level] = (byLevel[e.level] || 0) + 1;
      byModule[e.module] = (byModule[e.module] || 0) + 1;
      byStatus[e.status] = (byStatus[e.status] || 0) + 1;

      if (e.duration !== undefined) {
        totalDuration += e.duration;
        durationCount++;
      }

      if (e.level === 'error' && e.error) {
        const key = `${e.module}:${e.action}`;
        if (!errors[key]) errors[key] = { module: e.module, action: e.action, count: 0 };
        errors[key].count++;
      }
    }

    // throughput per minute (last 10 minutes)
    const now = Date.now();
    const throughput: { timestamp: string; count: number }[] = [];
    for (let i = 9; i >= 0; i--) {
      const start = now - (i + 1) * 60000;
      const end = now - i * 60000;
      const count = entries.filter(e => {
        const t = new Date(e.timestamp).getTime();
        return t >= start && t < end;
      }).length;
      const ts = new Date(start + 30000).toISOString().slice(11, 19);
      throughput.push({ timestamp: ts, count });
    }

    const total = entries.length;
    const failures = byStatus['failure'] || 0;

    return {
      total,
      byLevel,
      byModule,
      byStatus,
      failureRate: total > 0 ? Math.round((failures / total) * 10000) / 100 : 0,
      avgDuration: durationCount > 0 ? Math.round(totalDuration / durationCount) : 0,
      topErrors: Object.values(errors).sort((a, b) => b.count - a.count).slice(0, 10),
      throughput,
    };
  }
}

export const logger = new Logger();
