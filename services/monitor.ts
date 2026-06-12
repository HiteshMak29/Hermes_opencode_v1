export interface SystemMetrics {
  uptime: number;
  memory: { heapUsed: number; heapTotal: number; rss: number; external: number };
  activeRequests: number;
  activeConnections: number;
  requestRate1m: number;
  requestRate5m: number;
  responseTimeHistogram: { label: string; count: number; p50: number; p95: number; p99: number };
  topSlowEndpoints: { path: string; method: string; count: number; avgDuration: number; maxDuration: number }[];
  topModules: { module: string; count: number }[];
  errorRate: number;
  lastError: string | null;
  uptimeDays: number;
  healthy: boolean;
}

interface RequestSample {
  path: string;
  method: string;
  duration: number;
  statusCode: number;
  timestamp: number;
  payloadBytes: number;
  correlationId?: string;
}

class Monitor {
  private activeRequests = 0;
  private requestSamples: RequestSample[] = [];
  private maxSamples = 5000;
  private startTime = Date.now();
  private concurrentIps = new Map<string, number>();
  private ipWindow = 5 * 60 * 1000; // 5 min

  beginRequest(): void {
    this.activeRequests++;
  }

  endRequest(sample: Omit<RequestSample, 'timestamp'>): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    this.requestSamples.push({ ...sample, timestamp: Date.now() });
    if (this.requestSamples.length > this.maxSamples) {
      this.requestSamples = this.requestSamples.slice(-this.maxSamples);
    }
  }

  trackIp(ip: string): void {
    this.concurrentIps.set(ip, Date.now());
    // prune stale
    const cutoff = Date.now() - this.ipWindow;
    for (const [k, v] of this.concurrentIps) {
      if (v < cutoff) this.concurrentIps.delete(k);
    }
  }

  getConcurrentIps(): number {
    const cutoff = Date.now() - this.ipWindow;
    let count = 0;
    for (const v of this.concurrentIps.values()) {
      if (v >= cutoff) count++;
    }
    return count;
  }

  private getRecentSamples(minutes: number): RequestSample[] {
    const cutoff = Date.now() - minutes * 60 * 1000;
    return this.requestSamples.filter(s => s.timestamp >= cutoff);
  }

  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const idx = Math.ceil(p / 100 * sorted.length) - 1;
    return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
  }

  getMetrics(): SystemMetrics {
    const uptime = Date.now() - this.startTime;
    const mem = process.memoryUsage();
    const samples1m = this.getRecentSamples(1);
    const samples5m = this.getRecentSamples(5);
    const samples10m = this.getRecentSamples(10);

    // response time histogram for last 10 min
    const durations = samples10m.map(s => s.duration).sort((a, b) => a - b);
    const histBins = [10, 50, 100, 200, 500, 1000, 2000];
    const hist: { label: string; count: number }[] = [];
    let prev = 0;
    for (const bin of histBins) {
      const count = durations.filter(d => d > prev && d <= bin).length;
      hist.push({ label: prev === 0 ? `<${bin}ms` : `${prev}-${bin}ms`, count });
      prev = bin;
    }
    const over = durations.filter(d => d > prev).length;
    if (over > 0) hist.push({ label: `>${prev}ms`, count: over });

    // slow endpoints
    const endpointMap = new Map<string, { count: number; total: number; max: number }>();
    for (const s of samples10m) {
      const key = `${s.method} ${s.path}`;
      const existing = endpointMap.get(key) || { count: 0, total: 0, max: 0 };
      existing.count++;
      existing.total += s.duration;
      existing.max = Math.max(existing.max, s.duration);
      endpointMap.set(key, existing);
    }
    const topSlowEndpoints = [...endpointMap.entries()]
      .map(([key, v]) => {
        const [method, ...pathParts] = key.split(' ');
        return { method, path: pathParts.join(' '), count: v.count, avgDuration: Math.round(v.total / v.count), maxDuration: v.max };
      })
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 10);

    // top modules
    const moduleCount: Record<string, number> = {};
    for (const s of samples10m) {
      const mod = s.path.split('/')[2] || 'root';
      moduleCount[mod] = (moduleCount[mod] || 0) + 1;
    }
    const topModules = Object.entries(moduleCount)
      .map(([module, count]) => ({ module, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // error rate
    const errors10m = samples10m.filter(s => s.statusCode >= 400);
    const errorRate = samples10m.length > 0 ? (errors10m.length / samples10m.length) * 100 : 0;

    const lastErrorSample = [...this.requestSamples].reverse().find(s => s.statusCode >= 400);
    const lastError = lastErrorSample ? `${lastErrorSample.method} ${lastErrorSample.path} (${lastErrorSample.statusCode})` : null;

    return {
      uptime,
      uptimeDays: uptime / 86400000,
      memory: { heapUsed: mem.heapUsed, heapTotal: mem.heapTotal, rss: mem.rss, external: mem.external },
      activeRequests: this.activeRequests,
      activeConnections: this.getConcurrentIps(),
      requestRate1m: samples1m.length,
      requestRate5m: Math.round(samples5m.length / 5),
      responseTimeHistogram: { label: 'response time', count: durations.length, p50: this.percentile(durations, 50), p95: this.percentile(durations, 95), p99: this.percentile(durations, 99) },
      topSlowEndpoints,
      topModules,
      errorRate: Math.round(errorRate * 100) / 100,
      lastError,
      healthy: errorRate < 10 && this.activeRequests < 100 && mem.heapUsed < mem.heapTotal * 0.9,
    };
  }
}

export const monitor = new Monitor();
