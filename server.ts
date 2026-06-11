import express from "express";
import { createServer as createViteServer } from "vite";
import pg from "pg";
import mssql from "mssql";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON
  app.use(express.json());

  // --- API ROUTES FOR SIS, LMS, AND CRM ---
  
  // SIS (Student Information System) Dedicated Microservice & Staging DB APIs
  
  // Card 1: Student Profile Header Widget
  // SQL Query: SELECT student_id, first_name, last_name, major, minor, year, current_gpa, total_credits, program FROM staging_students WHERE student_id = ?;
  app.get("/api/sis/staging/profile/:id", async (req, res) => {
    const { id } = req.params;
    try {
      // In a production setup, you would query the staging database:
      // const [student] = await db.execute("SELECT student_id, name, major, minor, current_gpa, total_credits, year FROM staging_students WHERE student_id = ?", [id]);
      
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
      res.status(500).json({ success: false, error: "Database query failed for profile card" });
    }
  });

  // Card 2: Tuition & Outstanding Balances Alert Widget
  // SQL Query: SELECT student_id, total_outstanding, last_payment, hold_flag FROM staging_tuition_balances WHERE student_id = ?;
  app.get("/api/sis/staging/finances/:id", async (req, res) => {
    const { id } = req.params;
    try {
      // Production Staging Query:
      // const [balance] = await db.execute("SELECT student_id, outstanding_balance, hold_flag FROM staging_tuition_balances WHERE student_id = ?", [id]);
      
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
      res.status(500).json({ success: false, error: "Database query failed for finance card" });
    }
  });

  // Card 3: Semester Registered Courses List Widget
  // SQL Query: SELECT course_code, course_name, credits, grade, attendance, status FROM staging_enrolled_courses WHERE student_id = ? AND semester_id = ?;
  app.get("/api/sis/staging/courses/:id", async (req, res) => {
    const { id } = req.params;
    const term = req.query.term || "f24";
    try {
      // Production Staging Query:
      // const courses = await db.execute("SELECT course_code, course_name, credits, attendance, status FROM staging_enrolled_courses WHERE student_id = ? AND semester_id = ?", [id, term]);
      
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
      res.status(500).json({ success: false, error: "Database query failed for course roster card" });
    }
  });

  // Card 4: Health & Medical Immunization Compliance Card
  // SQL Query: SELECT requirement_id, req_name, status, due_date FROM staging_medical_requirements WHERE student_id = ?;
  app.get("/api/sis/staging/medical/:id", async (req, res) => {
    const { id } = req.params;
    try {
      // Production Staging Query:
      // const records = await db.execute("SELECT req_name, status, due_date FROM staging_medical_requirements WHERE student_id = ?", [id]);
      
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
      res.status(500).json({ success: false, error: "Database query failed for health compliance card" });
    }
  });

  // Staging SQL Sandbox endpoint
  app.post("/api/sis/staging/execute-sql", async (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query statement is required" });

    // Parse SELECT columns, splitting by comma only at the top level
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

    // Generate mock rows based on column names
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

    return res.json({ columns, rows, execTimeMs: Math.floor(Math.random() * 20) + 5 });
  });

  // Live Active Card SQL Executor Bridge (real DB connections)
  app.post("/api/sis/staging/execute-card-query", async (req, res) => {
    const { connection, sqlQuery } = req.body;
    if (!sqlQuery) {
      return res.status(400).json({ success: false, error: "SQL query statement is required." });
    }

    if (!connection || connection.id === 'sis-production') {
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

      return res.json({
        success: true,
        simulated: true,
        rows,
        columns
      });
    }

    const { dbType, dbHost, dbPort, dbName, dbUser, dbPass, dbSslMode } = connection;
    
    let processedQuery = sqlQuery;
    processedQuery = processedQuery.replace(/@StudentId/gi, "'1028617'");
    processedQuery = processedQuery.replace(/:student_id/gi, "'1028617'");

    if (dbType === "sqlserver" || dbType === "mssql") {
      try {
        const config = {
          user: dbUser,
          password: dbPass,
          server: dbHost,
          port: parseInt(dbPort) || 1433,
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

        return res.json({
          success: true,
          rows: result.recordset,
          columns: result.recordset && result.recordset.length > 0 ? Object.keys(result.recordset[0]) : []
        });
      } catch (error: any) {
        console.warn("MSSQL connection/query failed:", error.message);
        return res.status(200).json({
          success: false,
          error: error.message || "Failed to query MSSQL Server backend",
          code: error.code || "DB_ERROR"
        });
      }
    } else if (dbType === "postgresql" || dbType === "postgres") {
      try {
        const poolConfig: pg.PoolConfig = {
          user: dbUser,
          host: dbHost,
          database: dbName,
          password: dbPass,
          port: parseInt(dbPort) || 5432,
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

        return res.json({
          success: true,
          rows,
          columns: cols
        });
      } catch (error: any) {
        console.warn("PostgreSQL connection/query failed:", error.message);
        return res.status(200).json({
          success: false,
          error: error.message || "Failed to query PostgreSQL backend",
          code: error.code || "DB_ERROR"
        });
      }
    }

    return res.status(400).json({
      success: false,
      error: `Database platform '${dbType}' is not currently configured for executing card telemetry.`
    });
  });

  // Real database connection test endpoint
  app.post("/api/test-connection", async (req, res) => {
    const { sourceType, dbType, dbHost, dbPort, dbName, dbUser, dbPass, dbSslMode, domain, baseDn, apiUrl, apiKey, apiPlatform } = req.body;
    const actualType = sourceType || dbType;

    if (!actualType) {
      return res.status(400).json({ success: false, error: "Missing source type" });
    }

    const startTime = Date.now();

    if (actualType === "sqlserver" || actualType === "mssql") {
      try {
        const config = {
          user: dbUser,
          password: dbPass,
          server: dbHost,
          port: parseInt(dbPort) || 1433,
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
        return res.json({ success: true, latency: Date.now() - startTime });
      } catch (error: any) {
        return res.json({ success: false, error: error.message, latency: Date.now() - startTime });
      }
    } else if (actualType === "postgresql" || actualType === "postgres") {
      try {
        const poolConfig: pg.PoolConfig = {
          user: dbUser,
          host: dbHost,
          database: dbName || 'postgres',
          password: dbPass,
          port: parseInt(dbPort) || 5432,
          connectionTimeoutMillis: 5000
        };
        if (dbSslMode === "require" || dbSslMode === "prefer") {
          poolConfig.ssl = { rejectUnauthorized: false };
        }
        const client = new pg.Client(poolConfig);
        await client.connect();
        await client.query('SELECT 1');
        await client.end();
        return res.json({ success: true, latency: Date.now() - startTime });
      } catch (error: any) {
        return res.json({ success: false, error: error.message, latency: Date.now() - startTime });
      }
    } else if (actualType === "active-directory") {
      // LDAP bind test — requires ldapjs package
      let ldap: any;
      try {
        ldap = await import('ldapjs');
        const client = ldap.createClient({
          url: `ldap${dbSslMode === 'require' || dbSslMode === 'prefer' ? 's' : ''}://${domain || dbHost}:${parseInt(dbPort) || 389}`,
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
        return res.json({ success: true, latency: Date.now() - startTime });
      } catch (error: any) {
        return res.json({ success: false, error: `LDAP connection failed: ${error.message}`, latency: Date.now() - startTime });
      }
    } else if (['canvas', 'blackboard', 'moodle', 'banner', 'ellucian', 'custom-api'].includes(actualType)) {
      // API-based sources: attempt an HTTP GET to the provided URL
      try {
        if (!apiUrl) throw new Error('API URL is required');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey || ''}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (response.ok || response.status < 500) {
          return res.json({ success: true, latency: Date.now() - startTime, statusCode: response.status });
        } else {
          return res.json({ success: false, error: `API returned status ${response.status}`, latency: Date.now() - startTime });
        }
      } catch (error: any) {
        return res.json({ success: false, error: `API request failed: ${error.message}`, latency: Date.now() - startTime });
      }
    } else {
      return res.status(400).json({ success: false, error: `Unsupported source type: '${actualType}'` });
    }
  });

  // --- VITE MIDDLEWARE ---
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
