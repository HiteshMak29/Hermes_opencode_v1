import express from "express";
import { createServer as createViteServer } from "vite";
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

    // Sanitize or simulate standard queries
    const upperQuery = query.trim().toUpperCase();
    
    // Simulate typical card queries
    if (upperQuery.includes("STAGING_STUDENTS")) {
      return res.json({
        columns: ["student_id", "name", "major", "minor", "year", "current_gpa", "total_credits"],
        rows: [
          ["2024-8842-JU", "Alex Johnson", "Computer Science & Engineering", "Mathematics", "3", "3.82", "92"]
        ],
        execTimeMs: 12
      });
    } else if (upperQuery.includes("STAGING_TUITION_BALANCES")) {
      return res.json({
        columns: ["student_id", "outstanding_balance", "hold_flag", "due_date"],
        rows: [
          ["2024-8842-JU", "8420.00", "TRUE", "2026-10-30"]
        ],
        execTimeMs: 8
      });
    } else if (upperQuery.includes("STAGING_ENROLLED_COURSES")) {
      return res.json({
        columns: ["course_code", "course_name", "credits", "attendance", "status"],
        rows: [
          ["CS501", "Artificial Intelligence", "4", "85", "In Progress"],
          ["CS505", "Computer Networks", "4", "92", "In Progress"],
          ["MA401", "Graph Theory", "3", "78", "In Progress"]
        ],
        execTimeMs: 15
      });
    } else if (upperQuery.includes("STAGING_MEDICAL_REQUIREMENTS")) {
      return res.json({
        columns: ["requirement_id", "name", "status", "due_date"],
        rows: [
          ["m1", "MMR Vaccine", "Uploaded", "2024-08-15"],
          ["m2", "Meningococcal Vaccine", "Uploaded", "2024-08-15"],
          ["m3", "Physical Exam Form", "Pending", "2024-11-15"],
          ["m4", "Health Insurance Proof", "Uploaded", "2024-09-01"]
        ],
        execTimeMs: 10
      });
    }

    // Default general query simulation
    return res.json({
      columns: ["id", "query_status", "system_source", "timestamp"],
      rows: [
        ["1", "Success", "SIS_Micro_Service", new Date().toISOString()]
      ],
      execTimeMs: 5
    });
  });

  // Legacy fallback SIS URL query handler for backwards compatibility

  // LMS (Learning Management System) API
  app.get("/api/lms/courses/:studentId", async (req, res) => {
    const { studentId } = req.params;
    const LMS_API_URL = process.env.LMS_API_URL;
    const LMS_API_KEY = process.env.LMS_API_KEY;

    if (!LMS_API_URL || !LMS_API_KEY) {
      return res.status(500).json({ error: "LMS credentials not configured" });
    }

    try {
      // Real API call to LMS would go here
      res.json([{ id: "CS101", name: "Intro to Programming", grade: "A" }]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch from LMS" });
    }
  });

  // CRM (Customer Relationship Management) API
  app.get("/api/crm/leads/:email", async (req, res) => {
    const { email } = req.params;
    const CRM_API_URL = process.env.CRM_API_URL;
    const CRM_API_KEY = process.env.CRM_API_KEY;

    if (!CRM_API_URL || !CRM_API_KEY) {
      return res.status(500).json({ error: "CRM credentials not configured" });
    }

    try {
      // Real API call to CRM would go here
      res.json({ email, status: "Active Lead", lastContact: "2026-04-01" });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch from CRM" });
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
