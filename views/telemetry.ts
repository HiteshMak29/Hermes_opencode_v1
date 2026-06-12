const SESSION_KEY = 'juc_session_id';
const TELEMETRY_INTERVAL = 60000; // heartbeat every 60s

function getSessionId(): string {
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

function sendTelemetry(body: Record<string, unknown>): void {
  try {
    const payload = {
      ...body,
      session: getSessionId(),
      url: location.href,
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    };
    fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => { /* silent */ });
  } catch {
    // fail silent
  }
}

// ── Page view tracking ──

let pageLoadMark: number | null = null;

export function trackPageView(pageName: string): void {
  pageLoadMark = performance.now();
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;

  sendTelemetry({
    type: 'page-view',
    module: pageName,
    action: 'navigate',
    duration: nav ? Math.round(nav.domContentLoadedEventEnd) : 0,
    metadata: {
      loadTime: nav ? Math.round(nav.loadEventEnd - nav.startTime) : 0,
      domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) : 0,
      domInteractive: nav ? Math.round(nav.domInteractive) : 0,
      timing: nav ? {
        dns: Math.round(nav.domainLookupEnd - nav.domainLookupStart),
        tcp: Math.round(nav.connectEnd - nav.connectStart),
        tls: nav.secureConnectionStart ? Math.round(nav.connectEnd - nav.secureConnectionStart) : 0,
        ttfb: Math.round(nav.responseStart - nav.requestStart),
        download: Math.round(nav.responseEnd - nav.responseStart),
        domParse: Math.round(nav.domInteractive - nav.responseEnd),
        domReady: Math.round(nav.domContentLoadedEventEnd - nav.domInteractive),
        scriptsLoaded: Math.round(nav.loadEventEnd - nav.domContentLoadedEventEnd),
      } : null,
    },
  });
}

// ── Module access tracking ──

export function trackModuleAccess(moduleName: string, action: string, duration?: number): void {
  sendTelemetry({
    type: 'module-access',
    module: moduleName,
    action,
    duration: duration ?? 0,
    metadata: { timestamp: Date.now() },
  });
}

// ── Transaction tracking ──

export function trackTransaction(type: string, duration: number, opts?: { success?: boolean; metadata?: Record<string, unknown> }): void {
  sendTelemetry({
    type: 'transaction',
    action: type,
    duration,
    metadata: { success: opts?.success ?? true, ...opts?.metadata },
  });
}

// ── Performance metric ──

export function trackPerformance(module: string, metric: string, value: number, metadata?: Record<string, unknown>): void {
  sendTelemetry({
    type: 'performance',
    module,
    action: metric,
    duration: value,
    metadata,
  });
}

// ── Error tracking ──

export function trackFrontendError(action: string, errorMessage: string, metadata?: Record<string, unknown>): void {
  sendTelemetry({
    type: 'error',
    action,
    metadata: { errorMessage, ...metadata },
  });
}

// ── Heartbeat ──

let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

export function startHeartbeat(): void {
  if (heartbeatInterval) return;
  sendTelemetry({ type: 'heartbeat', action: 'start' });
  heartbeatInterval = setInterval(() => {
    sendTelemetry({
      type: 'heartbeat',
      action: 'ping',
      duration: Math.round(performance.now()),
      metadata: {
        memory: (performance as any).memory ? {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize,
        } : null,
      },
    });
  }, TELEMETRY_INTERVAL);
}

export function stopHeartbeat(): void {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  sendTelemetry({ type: 'heartbeat', action: 'stop', duration: Math.round(performance.now()) });
}

// ── Web Vitals (LCP, CLS, FID) ──

export function observeWebVitals(): void {
  try {
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      const lcpObs = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) {
          sendTelemetry({
            type: 'performance',
            module: 'web-vitals',
            action: 'LCP',
            duration: Math.round(last.startTime),
          });
        }
      });
      lcpObs.observe({ type: 'largest-contentful-paint', buffered: true });

      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
      });
      clsObs.observe({ type: 'layout-shift', buffered: true });

      // Report CLS on page unload
      window.addEventListener('beforeunload', () => {
        if (clsValue > 0) {
          sendTelemetry({
            type: 'performance',
            module: 'web-vitals',
            action: 'CLS',
            duration: Math.round(clsValue * 1000),
          });
        }
      });

      // First Input Delay
      const fidObs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          sendTelemetry({
            type: 'performance',
            module: 'web-vitals',
            action: 'FID',
            duration: Math.round((entry as any).processingStart - entry.startTime),
          });
        }
      });
      fidObs.observe({ type: 'first-input', buffered: true });
    }
  } catch {
    // PerformanceObserver not available
  }
}
