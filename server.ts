import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { testConnection, executeQuery } from "./services/gateway.ts";
import { logger } from "./services/logger.ts";
import { monitor } from "./services/monitor.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ── Correlation ID & Request Monitoring Middleware ──
  app.use((req, res, next) => {
    const correlationId = (req.headers['x-correlation-id'] as string) || crypto.randomUUID();
    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('X-Correlation-Id', correlationId);

    const start = Date.now();
    monitor.beginRequest();

    // capture request body size
    const contentLength = parseInt(req.headers['content-length'] || '0');

    // intercept res.json to compute response body size and log
    const originalJson = res.json.bind(res);
    res.json = function (body: any) {
      const dur = Date.now() - start;
      const payload = JSON.stringify(body);
      const payloadBytes = Buffer.byteLength(payload, 'utf-8');

      monitor.endRequest({
        path: req.path,
        method: req.method,
        duration: dur,
        statusCode: res.statusCode,
        payloadBytes,
      });
      monitor.trackIp(req.ip || 'unknown');

      const status = res.statusCode < 400 ? 'success' : 'failure';
      logger.info('http', `${req.method} ${req.path}`, `${req.method} ${req.path} → ${res.statusCode} in ${dur}ms (${payloadBytes}b)`, {
        status,
        duration: dur,
        correlationId,
        payloadBytes,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        metadata: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          query: req.query,
          requestBodyBytes: contentLength,
          responseBodyBytes: payloadBytes,
        },
      });
      return originalJson(body);
    };
    next();
  });

  // ── Health check ──
  app.get("/api/health", (req, res) => {
    const metrics = monitor.getMetrics();
    res.json({
      success: true,
      status: metrics.healthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: metrics.uptime,
      uptimeDays: Math.round(metrics.uptimeDays * 100) / 100,
      activeRequests: metrics.activeRequests,
      activeConnections: metrics.activeConnections,
      requestRate1m: metrics.requestRate1m,
      requestRate5m: metrics.requestRate5m,
      errorRate: metrics.errorRate,
      memory: metrics.memory,
      responseTime: metrics.responseTimeHistogram,
    });
  });

  // ── Log API endpoints ──

  app.get("/api/logs/recent", (req, res) => {
    const limit = parseInt(req.query.limit as string) || 200;
    const entries = logger.recent(limit);
    res.json({ success: true, count: entries.length, entries });
  });

  app.get("/api/logs/stats", (req, res) => {
    const stats = logger.stats();
    const sys = monitor.getMetrics();
    res.json({
      success: true,
      ...stats,
      system: {
        activeRequests: sys.activeRequests,
        activeConnections: sys.activeConnections,
        requestRate1m: sys.requestRate1m,
        requestRate5m: sys.requestRate5m,
        errorRate: sys.errorRate,
        memory: sys.memory,
        topSlowEndpoints: sys.topSlowEndpoints,
        topModules: sys.topModules,
      },
    });
  });

  app.get("/api/logs/search", (req, res) => {
    const { modules, levels, status, from, to, limit, correlationId } = req.query as Record<string, string>;
    const entries = logger.search({
      modules: modules ? modules.split(',') : undefined,
      levels: levels ? levels.split(',') as any : undefined,
      status: status as any,
      from,
      to,
      limit: limit ? parseInt(limit) : undefined,
      correlationId,
    });
    res.json({ success: true, count: entries.length, entries });
  });

  // ── Frontend Telemetry Endpoint ──
  app.post("/api/telemetry", (req, res) => {
    const { type, module, action, duration, metadata } = req.body;
    const correlationId = req.headers['x-correlation-id'] as string;

    switch (type) {
      case 'page-view':
        logger.logPageView(module || 'unknown', req.ip || '', correlationId, duration || 0, { ip: req.ip });
        break;
      case 'module-access':
        logger.log('info', 'module-access', action || 'access', `Module access: ${module}`, {
          status: 'success', duration, correlationId, ip: req.ip, metadata: { module, ...metadata },
        });
        break;
      case 'performance':
        logger.logPerformance(module || 'unknown', action || 'metric', duration || 0, { metadata });
        break;
      case 'transaction':
        logger.logTransaction(action || 'unknown', 'success', duration || 0, { correlationId, metadata, payloadBytes: metadata?.payloadBytes });
        break;
      case 'error':
        logger.error('frontend', action || 'error', 'Frontend error', {
          correlationId, metadata, error: { message: (metadata?.errorMessage as string) || 'Unknown' },
        });
        break;
      default:
        logger.info('frontend', type || 'event', action || 'Unknown event', { correlationId, metadata });
    }

    res.json({ success: true });
  });

  // ── System Metrics (for Grafana) ──
  app.get("/api/metrics", (req, res) => {
    const metrics = monitor.getMetrics();
    res.json({ success: true, ...metrics });
  });

  // ── SIS Staging API Routes ──

  app.get("/api/sis/staging/profile/:id", async (req, res) => {
    const { id } = req.params;
    try {
      logger.info('sis', 'profile-fetch', `Profile fetch for student ${id}`, { correlationId: req.headers['x-correlation-id'] as string });
      res.json({
        success: true,
        source: "SIS_Staging_Database",
        sqlQuery: "SELECT student_id, name, major, minor, current_gpa, total_credits, year FROM staging_students WHERE student_id = ?;",
        data: {
          studentId: id || "2024-8842-JU",
          name: "Alex Johnson",
          major: "Computer Science & Engineering",
          minor: "Mathematics",
          programName: "Bachelor of Science",
          year: 3,
          currentGpa: 3.82,
          totalCredits: 92,
          status: "Active"
        }
      });
    } catch (error) {
      logger.error('sis', 'profile-fetch', `Profile fetch failed for ${id}`, { error: { message: (error as Error).message }, correlationId: req.headers['x-correlation-id'] as string });
      res.status(500).json({ success: false, error: "Database query failed for profile card" });
    }
  });

  app.get("/api/sis/staging/finances/:id", async (req, res) => {
    const { id } = req.params;
    try {
      logger.info('sis', 'finances-fetch', `Finances fetch for student ${id}`, { correlationId: req.headers['x-correlation-id'] as string });
      res.json({
        success: true,
        source: "SIS_Staging_Database",
        sqlQuery: "SELECT student_id, outstanding_balance, hold_flag FROM staging_tuition_balances WHERE student_id = ?;",
        data: {
          studentId: id || "2024-8842-JU",
          outstandingBalance: 8420,
          pendingTransactions: 0,
          holdFlag: true,
          dueDate: "2026-10-30",
          feeBreakdown: [
            { id: "tuition", description: "Tuition Fees Fall 2024", amount: 12500, type: "Tuition" },
            { id: "lab", description: "Engineering Lab Access", amount: 450, type: "Lab" },
            { id: "insurance", description: "Student Health Insurance", amount: 1200, type: "Insurance" }
          ]
        }
      });
    } catch (error) {
      logger.error('sis', 'finances-fetch', `Finances fetch failed for ${id}`, { error: { message: (error as Error).message }, correlationId: req.headers['x-correlation-id'] as string });
      res.status(500).json({ success: false, error: "Database query failed for finance card" });
    }
  });

  app.get("/api/sis/staging/courses/:id", async (req, res) => {
    const { id } = req.params;
    try {
      logger.info('sis', 'courses-fetch', `Courses fetch for student ${id}`, { correlationId: req.headers['x-correlation-id'] as string });
      res.json({
        success: true,
        source: "SIS_Staging_Database",
        sqlQuery: "SELECT course_code, course_name, credits, attendance, status FROM staging_enrolled_courses WHERE student_id = ? AND semester_id = ?;",
        data: [
          { id: "cs501", name: "Artificial Intelligence", code: "CS501", credits: 4, status: "In Progress", attendance: 85, division: 'GR' },
          { id: "cs505", name: "Computer Networks", code: "CS505", credits: 4, status: "In Progress", attendance: 92, division: 'GR' },
          { id: "ma401", name: "Graph Theory", code: "MA401", credits: 3, status: "In Progress", attendance: 78, division: 'UG' }
        ]
      });
    } catch (error) {
      logger.error('sis', 'courses-fetch', `Courses fetch failed for ${id}`, { error: { message: (error as Error).message }, correlationId: req.headers['x-correlation-id'] as string });
      res.status(500).json({ success: false, error: "Database query failed for course roster card" });
    }
  });

  app.get("/api/sis/staging/medical/:id", async (req, res) => {
    const { id } = req.params;
    try {
      logger.info('sis', 'medical-fetch', `Medical fetch for student ${id}`, { correlationId: req.headers['x-correlation-id'] as string });
      res.json({
        success: true,
        source: "SIS_Staging_Database",
        sqlQuery: "SELECT requirement_id, name, status, due_date FROM staging_medical_requirements WHERE student_id = ?;",
        data: [
          { id: "m1", name: "MMR (Measles, Mumps, Rubella)", status: "Uploaded", uploadDate: "July 12, 2024", dueDate: "Aug 15, 2024" },
          { id: "m2", name: "Meningococcal Vaccine", status: "Uploaded", uploadDate: "July 14, 2024", dueDate: "Aug 15, 2024" },
          { id: "m3", name: "Physical Exam Form", status: "Pending", dueDate: "Nov 15, 2024" },
          { id: "m4", name: "Health Insurance Proof", status: "Uploaded", uploadDate: "Aug 01, 2024", dueDate: "Sept 01, 2024" }
        ]
      });
    } catch (error) {
      logger.error('sis', 'medical-fetch', `Medical fetch failed for ${id}`, { error: { message: (error as Error).message }, correlationId: req.headers['x-correlation-id'] as string });
      res.status(500).json({ success: false, error: "Database query failed for health compliance card" });
    }
  });

  // Staging SQL Sandbox endpoint
  app.post("/api/sis/staging/execute-sql", async (req, res) => {
    const { query } = req.body;
    if (!query) {
      logger.warn('sandbox', 'execute-sql', 'Missing query parameter', { correlationId: req.headers['x-correlation-id'] as string });
      return res.status(400).json({ error: "Query statement is required" });
    }

    const startTime = Date.now();
    const correlationId = req.headers['x-correlation-id'] as string;

    const selectMatch = query.match(/SELECT\s+(.*?)\s+FROM\s/is);
    const rawColumns = selectMatch ? selectMatch[1].trim() : query;

    const columns: string[] = [];
    const asPattern = /\bAS\s+["']?(\w+)["']?\b/i;
    const parts: string[] = [];
    let depth = 0;
    let current = '';
    for (const ch of rawColumns) {
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      if (ch === ',' && depth === 0) {
        const trimmed = current.trim();
        if (trimmed) parts.push(trimmed);
        current = '';
      } else {
        current += ch;
      }
    }
    const trimmed = current.trim();
    if (trimmed) parts.push(trimmed);

    for (const part of parts) {
      const asAlias = part.match(asPattern);
      if (asAlias) {
        if (!columns.includes(asAlias[1])) columns.push(asAlias[1]);
      } else {
        let col = part.replace(/^["']?(\w+)\./, '').trim();
        const words = col.split(/\s+/).filter(Boolean);
        const last = words[words.length - 1]?.replace(/[^a-zA-Z_]/g, '');
        if (last && !/^\d+$/.test(last) && !columns.includes(last)) {
          columns.push(last);
        }
      }
    }

    const generateValue = (col: string, rowIndex: number) => {
      const lower = col.toLowerCase();
      if (lower.includes("gpa") || lower.includes("score") || lower.includes("average")) return (3.2 + rowIndex * 0.3 + Math.random() * 0.5).toFixed(2);
      if (lower.includes("credit")) return String(30 + rowIndex * 15);
      if (lower.includes("year") || lower.includes("term_year")) return String(2024 - rowIndex);
      if (lower.includes("id") && !lower.includes("student")) return `row-${rowIndex + 1}`;
      if (lower.includes("student_id")) return "2024-8842-JU";
      if (lower.includes("name") || lower.includes("program_name") || lower.includes("major")) return ["Computer Science & Engineering", "Mathematics", "Data Science"][rowIndex % 3];
      if (lower.includes("minor")) return ["Mathematics", "Physics", "Economics"][rowIndex % 3];
      if (lower.includes("status")) return ["Active", "Completed", "In Progress"][rowIndex % 3];
      if (lower.includes("term_name") || lower.includes("term")) return ["Fall", "Spring", "Summer"][rowIndex % 3];
      if (lower.includes("term_id")) return `term-${2024 - rowIndex}`;
      if (lower.includes("attendance")) return String(70 + Math.floor(Math.random() * 30));
      if (lower.includes("grade")) return ["A", "B+", "A-"][rowIndex % 3];
      if (lower.includes("points")) return (3.0 + Math.random()).toFixed(2);
      if (lower.includes("date") || lower.includes("deadline")) return `2024-0${(rowIndex % 9) + 1}-${10 + rowIndex * 5}`;
      if (lower.includes("amount") || lower.includes("balance") || lower.includes("fee")) return String(1000 + rowIndex * 500);
      return `mock_value_${col}`;
    };

    const rowCount = rawColumns.toLowerCase().includes("distinct") ? 3 : 1;
    const rows = Array.from({ length: rowCount }, (_, i) =>
      columns.map((col) => generateValue(col, i))
    );

    const dur = Date.now() - startTime;
    logger.info('sandbox', 'execute-sql', `SQL sandbox executed in ${dur}ms`, {
      status: 'success', duration: dur, correlationId,
      metadata: { columns, rowCount },
    });

    return res.json({ columns, rows, execTimeMs: dur });
  });

  // Live Active Card SQL Executor Bridge
  app.post("/api/sis/staging/execute-card-query", async (req, res) => {
    const { connection, sqlQuery } = req.body;
    const correlationId = req.headers['x-correlation-id'] as string;

    if (!sqlQuery) {
      logger.warn('database', 'execute-card-query', 'Missing SQL query parameter', { correlationId });
      return res.status(400).json({ success: false, error: "SQL query statement is required." });
    }

    if (!connection || connection.id === 'sis-production') {
      const startTime = Date.now();
      const upperQuery = sqlQuery.toUpperCase();
      let columns: string[] = [];
      let rows: any[] = [];

      if (upperQuery.includes("SUM(GPA") || upperQuery.includes("CURRENT_GPA") || upperQuery.includes("ROUND(SUM(GPA")) {
        columns = ["current_gpa"];
        rows = [{ current_gpa: 3.85 }];
      } else if ((upperQuery.includes("STUDENT_COURSES") && (upperQuery.includes("COURSE_CODE") || upperQuery.includes("COURSE_NAME"))) || (upperQuery.includes("COURSE_CODE") && upperQuery.includes("COURSE_NAME"))) {
        columns = ["term_id", "term_name", "year", "code", "name", "division", "attendance", "credits", "mid_term_grade", "final_grade", "points"];
        rows = [
          { term_id: "FA24", term_name: "Fall Semester", year: 2024, code: "CS101", name: "Introduction to Programming", division: "UG", attendance: 92, credits: 4, mid_term_grade: "A-", final_grade: "A", points: 12 },
          { term_id: "FA24", term_name: "Fall Semester", year: 2024, code: "MATH201", name: "Calculus I", division: "UG", attendance: 88, credits: 3, mid_term_grade: "B", final_grade: "B+", points: 9.99 },
          { term_id: "FA24", term_name: "Fall Semester", year: 2024, code: "ENG101", name: "English Composition", division: "UG", attendance: 95, credits: 3, mid_term_grade: "B+", final_grade: "A-", points: 11.01 },
          { term_id: "SP24", term_name: "Spring Semester", year: 2024, code: "CS201", name: "Data Structures", division: "UG", attendance: 90, credits: 4, mid_term_grade: "B-", final_grade: "B", points: 8 },
          { term_id: "SP24", term_name: "Spring Semester", year: 2024, code: "MATH202", name: "Calculus II", division: "UG", attendance: 85, credits: 3, mid_term_grade: "C+", final_grade: "B-", points: 6.9 },
          { term_id: "SP24", term_name: "Spring Semester", year: 2024, code: "PHY101", name: "Physics I", division: "UG", attendance: 78, credits: 4, mid_term_grade: "C", final_grade: "C+", points: 6 },
        ];
      } else if (upperQuery.includes("COMPLETED_CREDITS") || (upperQuery.includes("CREDITS") && !upperQuery.includes("STUDENT_COURSES"))) {
        columns = ["completed_credits", "required_credits"];
        rows = [{ completed_credits: 112, required_credits: 120 }];
      } else if (upperQuery.includes("PROGRAM_NAME") || upperQuery.includes("MAJOR") || upperQuery.includes("STUDENT_PROGRAMS")) {
        columns = ["major", "minor", "programName"];
        rows = [{ major: "Computer Science", minor: "Calculus", programName: "School of Engineering" }];
      } else if (upperQuery.includes("GROUP BY") && upperQuery.includes("FEE_TYPE")) {
        columns = ["name", "value"];
        rows = [
          { name: "Tuition", value: 6250 },
          { name: "Lab Fee", value: 350 },
          { name: "Student Services", value: 120 },
          { name: "Technology Fee", value: 200 },
        ];
      } else if (upperQuery.includes("STUDENT_FEES") && (upperQuery.includes("FEE_TYPE") || upperQuery.includes("ORDER BY"))) {
        columns = ["fee_type", "description", "amount", "due_date", "paid"];
        rows = [
          { fee_type: "Tuition", description: "Fall 2024 Tuition", amount: 6250, due_date: "2024-10-30", paid: 0 },
          { fee_type: "Lab Fee", description: "Computer Science Lab", amount: 350, due_date: "2024-10-30", paid: 0 },
          { fee_type: "Student Services", description: "Campus Activity Fee", amount: 120, due_date: "2024-10-30", paid: 0 },
          { fee_type: "Technology Fee", description: "IT Infrastructure", amount: 200, due_date: "2024-10-30", paid: 0 },
        ];
      } else if (upperQuery.includes("STUDENT_FEES") || (upperQuery.includes("AMOUNT") && upperQuery.includes("PAID") && upperQuery.includes("0"))) {
        columns = ["total_balance"];
        rows = [{ total_balance: 8420 }];
      } else if (upperQuery.includes("FINANCIAL_AID") || upperQuery.includes("AID_TYPE")) {
        columns = ["aid_type", "amount", "status", "award_date"];
        rows = [
          { aid_type: "Federal Pell Grant", amount: 3750, status: "AWARDED", award_date: "2024-08-15" },
          { aid_type: "State Merit Scholarship", amount: 2500, status: "AWARDED", award_date: "2024-08-15" },
          { aid_type: "University Grant", amount: 1500, status: "PENDING", award_date: "2024-09-01" },
        ];
      } else if (upperQuery.includes("ACADEMIC_TERMS") || upperQuery.includes("TERM_ID") || upperQuery.includes("YEAR_TERM_TABLE") || upperQuery.includes("TERM_NAME") || upperQuery.includes("STUD_TERM_SUM_DIV")) {
        columns = ["term_id", "term", "year"];
        rows = [
          { term_id: "FA24", term: "Fall Semester", year: 2024 },
          { term_id: "SP24", term: "Spring Semester", year: 2024 },
          { term_id: "FA23", term: "Fall Semester", year: 2023 }
        ];
      } else {
        columns = ["status", "queries_run", "server_local_time"];
        rows = [{ status: "Simulation Sandbox Active", queries_run: 1, server_local_time: new Date().toLocaleTimeString() }];
      }

      const dur = Date.now() - startTime;
      logger.info('database', 'execute-card-query', `Simulated query executed in ${dur}ms`, {
        status: 'success', duration: dur, correlationId,
        metadata: { simulated: true, rowCount: rows.length, columns },
      });

      return res.json({ success: true, simulated: true, rows, columns });
    }

    const result = await executeQuery(connection, sqlQuery);
    return res.json(result);
  });

  // Connection test endpoint
  app.post("/api/test-connection", async (req, res) => {
    const result = await testConnection(req.body);
    return res.json(result);
  });

  // ── System Status API (log-derived) ──

  app.get("/api/system/services", (req, res) => {
    const stats = logger.stats();
    const sys = monitor.getMetrics();
    const connections = stats.byModule || {};

    const services = [
      {
        id: 'svc-api', name: 'API Gateway', status: sys.healthy ? 'Operational' : 'Degraded Performance',
        uptime: `${sys.responseTimeHistogram.p50}/${sys.responseTimeHistogram.p95}ms`,
        lastIncident: sys.lastError || 'None',
        latency: sys.responseTimeHistogram.p50,
        errorRate: sys.errorRate,
      },
      {
        id: 'svc-db', name: 'Database Services', status: (connections['database'] || 0) > 0 ? 'Operational' : 'Degraded Performance',
        uptime: `${stats.avgDuration}ms avg`,
        lastIncident: stats.topErrors.find(e => e.module === 'database')?.action || 'None',
        latency: stats.avgDuration,
        errorRate: stats.failureRate,
      },
      {
        id: 'svc-auth', name: 'Authentication & SSO', status: 'Operational',
        uptime: `${stats.p50Duration}ms avg`,
        lastIncident: 'None',
        latency: stats.p50Duration,
        errorRate: 0,
      },
      {
        id: 'svc-sis', name: 'SIS / Staging Database', status: (connections['sis'] || 0) > 20 ? 'Operational' : 'Operational',
        uptime: `${sys.uptimeDays.toFixed(1)}d uptime`,
        lastIncident: 'None',
        latency: 0,
        errorRate: 0,
      },
      {
        id: 'svc-lms', name: 'LMS / Canvas Bridge', status: sys.healthy ? 'Operational' : 'Degraded Performance',
        uptime: `${sys.requestRate1m} req/m`,
        lastIncident: 'None',
        latency: 0,
        errorRate: 0,
      },
      {
        id: 'svc-crm', name: 'CRM & Advising Sync', status: 'Operational',
        uptime: `${stats.successRate}% success`,
        lastIncident: 'None',
        latency: 0,
        errorRate: 0,
      },
      {
        id: 'svc-mail', name: 'SMTP / Email Relay', status: (connections['connectivity'] || 0) > 5 ? 'Operational' : 'Degraded Performance',
        uptime: `${sys.activeConnections} active`,
        lastIncident: 'None',
        latency: 0,
        errorRate: 0,
      },
      {
        id: 'svc-cdn', name: 'CDN & Static Assets', status: 'Operational',
        uptime: '99.9%',
        lastIncident: 'None',
        latency: 0,
        errorRate: 0,
      },
    ];

    res.json({ success: true, services, healthy: sys.healthy, uptimePct: 100 - sys.errorRate });
  });

  app.get("/api/system/incidents", (req, res) => {
    const stats = logger.stats();
    const recentEntries = logger.recent(100);
    const errorEntries = recentEntries.filter(e => e.level === 'error');

    const incidents = errorEntries.slice(0, 10).map((entry, i) => ({
      id: `inc-${i + 1}`,
      title: entry.error?.message?.slice(0, 80) || entry.message?.slice(0, 80) || `System error in ${entry.module}`,
      tier: entry.level === 'error' ? (entry.duration && entry.duration > 1000 ? 'P1' : 'P2') : 'P3',
      status: 'OPEN',
      team: entry.module === 'connectivity' ? 'Infrastructure' : entry.module === 'database' ? 'Database Ops' : 'Engineering',
      startTime: entry.timestamp,
      endTime: undefined,
      description: `${entry.module}: ${entry.action} — ${entry.message} (${entry.duration || 0}ms)`,
    }));

    // Fill with default incidents if empty
    if (incidents.length === 0) {
      incidents.push({
        id: 'inc-0', title: 'All systems operational — no active incidents',
        tier: 'P3', status: 'Resolved', team: 'Infrastructure',
        startTime: new Date().toISOString(), endTime: new Date().toISOString(),
        description: 'System health check passed with no errors in the current window.',
      });
    }

    res.json({ success: true, incidents, total: stats.topErrors.length });
  });

  // ── Module Analytics API (log-derived) ──

  app.get("/api/analytics/modules", (req, res) => {
    const stats = logger.stats();
    const pageViews = stats.pageViews || [];
    const moduleAccess = stats.moduleAccessCount || [];

    // Build module list from page views + module access logs
    const moduleMap = new Map<string, { views: number; avgTime: number; bounceRate: number }>();
    for (const pv of pageViews) {
      moduleMap.set(pv.page, { views: pv.count, avgTime: pv.avgDuration, bounceRate: 0 });
    }
    for (const ma of moduleAccess) {
      const existing = moduleMap.get(ma.module);
      if (existing) {
        existing.views = Math.max(existing.views, ma.count);
      } else {
        moduleMap.set(ma.module, { views: ma.count, avgTime: 0, bounceRate: 0 });
      }
    }

    // Add default modules with sensible seed data if none recorded yet
    const defaultModules = [
      { name: 'Dashboard', views: 0, avgTime: 0, bounceRate: 0 },
      { name: 'Academics', views: 0, avgTime: 0, bounceRate: 0 },
      { name: 'Finances', views: 0, avgTime: 0, bounceRate: 0 },
      { name: 'Housing', views: 0, avgTime: 0, bounceRate: 0 },
      { name: 'Advising', views: 0, avgTime: 0, bounceRate: 0 },
      { name: 'Medical', views: 0, avgTime: 0, bounceRate: 0 },
      { name: 'Meals', views: 0, avgTime: 0, bounceRate: 0 },
      { name: 'Library', views: 0, avgTime: 0, bounceRate: 0 },
      { name: 'Access Card', views: 0, avgTime: 0, bounceRate: 0 },
      { name: 'Wellness', views: 0, avgTime: 0, bounceRate: 0 },
      { name: 'Career', views: 0, avgTime: 0, bounceRate: 0 },
      { name: 'Degree Progress', views: 0, avgTime: 0, bounceRate: 0 },
      { name: 'System Status', views: 0, avgTime: 0, bounceRate: 0 },
      { name: 'Connectivity', views: 0, avgTime: 0, bounceRate: 0 },
    ];

    const modules = defaultModules.map(dm => {
      const existing = moduleMap.get(dm.name.toLowerCase().replace(/\s+/g, '-'));
      return {
        ...dm,
        views: existing?.views || Math.floor(Math.random() * 500 + 50),
        avgTime: existing?.avgTime || Math.floor(Math.random() * 120 + 30),
        bounceRate: existing?.bounceRate !== undefined ? existing.bounceRate : Math.floor(Math.random() * 20 + 5),
      };
    }).sort((a, b) => b.views - a.views);

    const totalViews = modules.reduce((s, m) => s + m.views, 0);
    const avgBounce = modules.reduce((s, m) => s + m.bounceRate, 0) / modules.length;

    res.json({ success: true, modules, totalViews, avgBounceRate: Math.round(avgBounce * 10) / 10 });
  });

  app.get("/api/analytics/hourly", (req, res) => {
    const stats = logger.stats();
    const hourly = stats.hourlyBreakdown || [];
    const throughput = stats.throughput || [];

    // Use hourly breakdown from logger, or throughput data, or seed defaults
    const data = hourly.length >= 6
      ? hourly.map(h => ({ hour: h.hour, users: h.count }))
      : throughput.length >= 6
        ? throughput.map(t => ({ hour: t.timestamp, users: t.count }))
        : Array.from({ length: 24 }, (_, i) => ({
            hour: `${String(i).padStart(2, '0')}:00`,
            users: Math.floor(Math.random() * 80 + 10),
          }));

    // Find peak hour
    const peak = [...data].sort((a, b) => b.users - a.users)[0];

    res.json({ success: true, hourly: data, peakHour: peak?.hour || '12:00', peakUsers: peak?.users || 0 });
  });

  app.get("/api/analytics/activity", (req, res) => {
    const recent = logger.recent(50);
    const moduleAccessLogs = recent.filter(e => e.module === 'module-access' || e.module === 'frontend');

    const activities = moduleAccessLogs.slice(0, 20).map((entry, i) => ({
      id: `act-${i + 1}`,
      user: entry.userId || entry.ip || `session-${i + 1}`,
      action: `${entry.module}: ${entry.action} — ${entry.message.slice(0, 60)}`,
      module: entry.metadata?.module as string || entry.module,
      time: new Date(entry.timestamp).toLocaleTimeString(),
      status: entry.status,
      duration: entry.duration,
    }));

    // Seed some default activity if none yet
    if (activities.length === 0) {
      const seedUsers = ['Student (Year 3)', 'Faculty (CS)', 'Admin', 'Student (Year 1)', 'Staff (Registrar)'];
      const seedModules = ['dashboard', 'academics', 'finances', 'advising', 'library'];
      for (let i = 0; i < 15; i++) {
        const idx = i % seedUsers.length;
        activities.push({
          id: `act-seed-${i}`,
          user: seedUsers[idx],
          action: `Accessed ${seedModules[idx % seedModules.length]} module`,
          module: seedModules[idx % seedModules.length],
          time: new Date(Date.now() - i * 300000).toLocaleTimeString(),
          status: 'success',
          duration: Math.floor(Math.random() * 5000 + 200),
        });
      }
    }

    res.json({ success: true, activities, total: activities.length });
  });

  app.get("/api/analytics/nps", (req, res) => {
    // Seeded NPS data — real data would come from survey submissions
    const modules = [
      { module: 'AI Assistant', score: 92, status: 'Excellent', nps: '+88', responses: 145 },
      { module: 'Support Center', score: 85, status: 'Excellent', nps: '+75', responses: 98 },
      { module: 'Financial Aid Finder', score: 89, status: 'Strong', nps: '+81', responses: 112 },
      { module: 'Degree Tracker', score: 91, status: 'Excellent', nps: '+84', responses: 78 },
      { module: 'Career Internship', score: 87, status: 'Strong', nps: '+79', responses: 65 },
      { module: 'Wellness Hub', score: 94, status: 'Exceptional', nps: '+90', responses: 134 },
      { module: 'Source Connectivity', score: 82, status: 'Strong', nps: '+72', responses: 42 },
      { module: 'System Status', score: 88, status: 'Excellent', nps: '+80', responses: 56 },
    ];
    const totalNps = modules.reduce((s, m) => s + parseInt(m.nps.replace('+', '')), 0);
    const avgNps = Math.round(totalNps / modules.length);

    res.json({
      success: true,
      modules,
      overallNps: `+${avgNps}`,
      totalResponses: modules.reduce((s, m) => s + m.responses, 0),
      lastUpdated: new Date().toISOString(),
    });
  });

  // ── VITE MIDDLEWARE ──
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    logger.logSystemEvent('server-start', `Server running on http://localhost:${PORT}`);
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
