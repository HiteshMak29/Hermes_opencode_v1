# Progress Notes

## Goal
Make the portal fully localhost-compatible — no Google/Gemini dependencies, no static mock data. All cards load from SQL queries configured in Source Connectivity (ConnectivityTest).

## Done
- Merged local code with `origin/main` (git merge --allow-unrelated-histories)
- Removed all Google/Gemini dependencies:
  - Deleted `services/geminiService.ts`
  - Removed `@google/genai` from package.json (reinstalled — 29 packages removed)
  - Removed GEMINI_API_KEY / API_KEY from vite.config.ts
  - Cleaned .env.example / .env.local to only DB settings
- Emptied `constants.tsx` — all mock data replaced with typed null/empty defaults (no crashes)
- Fixed `PredictiveDetection.tsx` — replaced AI analysis import with local DEFAULT_ANALYSIS
- Fixed `StudentAssistant.tsx` — replaced AI chat with local echo response
- Switched `Academics.tsx` from mock-only `execute-sql` → real-DB-capable `execute-card-query`:
  - Resolves `connectionId` → full connection object from `juc_rdbms_connections`
  - Calls `POST /api/sis/staging/execute-card-query` with `{ connection, sqlQuery }`
  - Falls back to simulated data when connection is null or `sis-production`
- Enabled course details card in Academics:
  - Added `courses` binding — SQL joins student_courses with academic_terms
  - Transforms flat course rows → grouped `Semester[]` with GPA calculation
  - Replaced `SEMESTERS_MOCK` dependency with `dynamicSemesters` from SQL
  - Dev Mode SQL inspector for courses accordion
  - Added simulation data for courses in `server.ts` (6 rows, 2 semesters)
  - Added same binding to `ConnectivityTest.tsx` DEFAULT_SQL_BINDINGS
- Removed old semester accordion (replaced by new Course Details Card)
- Added Selected Term Course Details Card — shows latest term by default, updates on term filter
- Added ALL cards from ALL views to Source Connectivity Target UI Card list
- Made Target Portal View dropdown dynamic with section filtering
- Made ContactSection editable inline — hover the pencil icon to edit email, phone, department name directly on any page (persisted to localStorage `juc_contacts`)
- Enabled Finances section with SQL-driven data (balance, fees, aid, cost distribution)

## Contact Information (All Views)
Every ContactSection card now has an edit button (pencil icon) that appears on hover.
- Click to edit: Department Name, Email, Phone number
- Changes persist to `localStorage` under key `juc_contacts`
- No SQL/binding needed — edit directly on the page

## Source Connectivity — All Cards by Section

**Every card in the application should have a binding in Source Connectivity.**
This ensures all values (email, phone, address, GPA, balances, status, etc.) are driven by SQL queries, not hardcoded.

### Academics Section
| cardId | cardName | Purpose |
|---|---|---|
| `gpa` | GPA Summary Metric Card | Total GPA |
| `credits` | Completed Credits Card | Hours earned |
| `program` | Program Details Descriptor | Major/minor/program |
| `terms` | Academic Term List Filter | Term dropdown |
| `courses` | Course Details Accordion | Term course table |

### Dashboard Section
| cardId | cardName | Purpose |
|---|---|---|
| `dash-gpa` | Cumulative GPA | Dashboard GPA metric |
| `dash-credits` | Credits Earned | Dashboard credits metric |
| `dash-admissions` | Admissions Status | Status badge |
| `dash-aid` | Total Financial Aid | Aid amount |
| `dash-tuition` | Outstanding Tuition & Fees | Balance + deadline |
| `dash-schedule` | Upcoming Schedule | Appointment list |
| `dash-courses` | In-Progress Courses | Active courses grid |

### Advising Section
| cardId | cardName | Purpose |
|---|---|---|
| `adv-advisor` | Advisor Profile | Name, dept, office, hours |
| `adv-appointments` | Advising Appointments | Appointment list |
| `adv-notes` | Advising Notes | Advising notes list |

### Finances Section
| cardId | cardName | Purpose |
|---|---|---|
| `fin-balance` | Total Outstanding Balance | Total owed |
| `fin-fees` | Fee Breakdown | Fee line items |
| `fin-aid` | Financial Aid Awarded | Aid awards |
| `fin-cost-dist` | Cost Distribution Pie Chart | Pie chart data |

Also already in ConnectivityTest:
- Dashboard, Advising, Housing, Medical, Meals, Library, Wellness, Student Retention, Access Card, Career & Internship, Degree Progress, Module Analytics, System Status, Incident Management, Support Ticketing, Contact

### Housing Section
| cardId | cardName | Purpose |
|---|---|---|
| `hou-assignment` | Room Assignment | Building, room, dates |
| `hou-penalties` | Pending Room Charges & Penalties | Penalty list |
| `hou-financial` | Housing Financial Summary | Charges, utilities |

### Medical Section
| cardId | cardName | Purpose |
|---|---|---|
| `med-status` | Compliance Status | Clearance status |
| `med-requirements` | Clearance Items | Requirement checklist |

### Meals Section
| cardId | cardName | Purpose |
|---|---|---|
| `meal-balance` | Wallet Balance Hero | Balance + plan info |
| `meal-transactions` | Recent Transactions | Transaction list |

### Library Section
| cardId | cardName | Purpose |
|---|---|---|
| `lib-issued` | Books Currently Issued | Issued count |
| `lib-penalties` | Library Penalties | Penalty total |
| `lib-records` | Borrowing Records | Full history |
| `lib-ebooks` | Digital Library E-Books | E-book catalog |

### Wellness Section
| cardId | cardName | Purpose |
|---|---|---|
| `well-checkin` | Anonymous Wellness Check-In | Mood history |
| `well-counselling` | Self-Schedule Counselling | Available slots |
| `well-crisis` | Campus Emergency Contacts | Helpline numbers |

### Student Retention Section
| cardId | cardName | Purpose |
|---|---|---|
| `ret-confidence` | Dropout Risk Confidence | Risk score/level |
| `ret-trend` | Risk Probability Trend | Trend data |
| `ret-factors` | Contributing Risk Factors | Risk factors list |

### Access Card Section
| cardId | cardName | Purpose |
|---|---|---|
| `acc-card` | Digital Access Card | Student ID, photo, status |
| `acc-zones` | Authorization Zones | Zone access levels |
| `acc-audit` | Campus Entry Audit Trail | Entry log |

### Career & Internship Section
| cardId | cardName | Purpose |
|---|---|---|
| `career-jobs` | Smart Job Board Listings | Job matches |
| `career-resume` | AI Resume Feedback | Resume score |
| `career-alumni` | Alumni Career Paths | Alumni mentors |

### Degree Progress Section
| cardId | cardName | Purpose |
|---|---|---|
| `deg-progress` | Total Degree Progress Map | Credits/completion % |
| `deg-whatif` | What-If Major Planner | Alternative majors |
| `deg-prereq` | Prerequisite Conflict Flag | Missing prereqs |
| `deg-curriculum` | Curriculum Pathways & Course Sequence | Course sequence |

### Module Analytics Section
| cardId | cardName | Purpose |
|---|---|---|
| `mod-views` | Total Module Views | View counts |
| `mod-active` | Active Users (24h) | Active user count |
| `mod-session` | Avg Session Duration | Duration metric |
| `mod-satisfaction` | In-Portal Module Satisfaction & NPS | NPS scores |

### System Status Section
| cardId | cardName | Purpose |
|---|---|---|
| `sys-health` | Operational Health Badge | Uptime % |
| `sys-services` | Current Service Status Matrices | Service grid |
| `sys-incidents` | Active Incident History Log | Incident list |

### Incident Management Section
| cardId | cardName | Purpose |
|---|---|---|
| `inc-mttr` | Mean Time to Resolve | MTTR metric |
| `inc-dispatch` | Automatic Dispatch Success | Success % |
| `inc-listings` | Incident Listings | Incident table |

### Support Ticketing Section
| cardId | cardName | Purpose |
|---|---|---|
| `sup-tickets` | Active Support Tickets | Ticket list |

### Contact Section (all department contacts)
| cardId | cardName | Purpose |
|---|---|---|
| `contact-advising` | Advising Contact Info | Email, phone |
| `contact-finance` | Finance Contact Info | Email, phone |
| `contact-housing` | Housing Contact Info | Email, phone |
| `contact-medical` | Medical Contact Info | Email, phone |
| `contact-library` | Library Contact Info | Email, phone |
| `contact-meals` | Meals Contact Info | Email, phone |
| `contact-security` | Security Contact Info | Email, phone |
| `contact-registrar` | Registrar's Office Contact Info | Email, phone |

## Data Flow
```
ConnectivityTest → localStorage (juc_rdbms_connections + juc_card_sql_queries)
  → Views read bindings + connections
  → For each binding, resolves connection by ID
  → POST /api/sis/staging/execute-card-query { connection, sqlQuery }
     ├─ connection=null or id='sis-production' → simulated data
     └─ connection with real dbType → gateway routes to microservice
```

## Microservice Connectivity Architecture

The backend uses a **service-oriented microarchitecture** where each source type is handled by an independent, self-contained service module:

```
services/
  types.ts        — Shared interfaces (ConnectionParams, SourceService, etc.)
  registry.ts     — Maps source type → service module
  gateway.ts      — API gateway: routes testConnection / executeQuery to the right service
  rdbms.ts        — PostgreSQL & MSSQL (test + query execution)
  directory.ts    — Active Directory / LDAP (test only)
  messaging.ts    — SMTP Email Server (test only)
  transfer.ts     — SFTP Server (test only)
  storage.ts      — Local File System (test only)
  api.ts          — Canvas, Blackboard, Moodle, Banner, Ellucian, Custom API (test only)
```

Each service implements the `SourceService` interface:

```typescript
interface SourceService {
  type: string | string[];
  testConnection(params): Promise<TestResult>;
  executeQuery?(connection, sqlQuery): Promise<QueryResult>;  // RDBMS only
}
```

**Key principles:**
- One microservice per source type (or family, e.g. RDBMS handles postgresql + sqlserver)
- Services register themselves in `registry.ts` at import time
- `gateway.ts` dispatches `testConnection` and `executeQuery` calls to the correct service
- Adding a new source type = create a new service module + register it — no changes to server.ts
- All existing frontend code, localStorage connections, and SQL bindings preserved unchanged

**Supported source types:** postgresql, mysql, sqlite, oracle, sqlserver, active-directory, smtp, sftp, local-files, canvas, blackboard, moodle, banner, ellucian, custom-api

## Structured Logging & Application Monitoring

The system has a comprehensive structured logging framework designed for Grafana or a native dashboard.

### Architecture

```
services/
  logger.ts       — Core logger: rotating JSONL files + in-memory ring buffer (2000 entries)
```

### Log Schema (Grafana-compatible JSON)

Each log entry is written as a JSON line to `logs/app-YYYY-MM-DD.log`:

```json
{
  "timestamp": "2026-06-12T04:30:00.000Z",
  "level": "info|warn|error|debug",
  "module": "connectivity|database|auth|gateway|http|sis|system|module-access",
  "action": "test-connection|execute-query|login|route|etc.",
  "message": "Human-readable description",
  "status": "success|failure|pending",
  "duration": 123,
  "session": "session-id",
  "userId": "user-id",
  "ip": "client-ip",
  "userAgent": "user-agent-string",
  "metadata": { /* flexible context */ },
  "error": { "message": "...", "code": "DB_ERROR", "stack": "..." }
}
```

### What Is Logged

| Category | Events | Module |
|---|---|---|
| **Connectivity** | All test-connection attempts (per source type), latency, success/failure | `connectivity` |
| **Database Queries** | Every execute-card-query, SQL preview, row count, latency, errors | `database` |
| **Microservice Routing** | Gateway dispatch decisions, service resolution | `gateway` |
| **HTTP API** | Every request: method, path, status code, duration, client IP | `http` |
| **SIS Data** | Profile, finances, courses, medical fetches | `sis` |
| **SQL Sandbox** | Ad-hoc SQL execution, column counts | `sandbox` |
| **System Events** | Server start, gateway init | `system` |
| **Auth Events** | Login, logout, session events (via `logAuthEvent`) | `auth` |
| **Module Access** | Per-user per-session module access tracking (via `logModuleAccess`) | `module-access` |

### API Endpoints (for Grafana / dashboard consumption)

```
GET /api/logs/recent?limit=200     — Last N log entries from memory buffer
GET /api/logs/stats                — Aggregated stats: counts by level/module/status,
                                     failure rate, avg latency, throughput/min, top errors
GET /api/logs/search?modules=...   — Filtered search with query params:
  &levels=info,warn,error            modules (comma-separated)
  &status=failure                    levels (comma-separated)
  &from=2026-06-12T00:00:00Z        status filter
  &to=2026-06-12T23:59:59Z          time range
  &limit=100                         max results
```

### Stats Response Shape

```json
{
  "total": 1500,
  "byLevel": { "info": 1200, "warn": 200, "error": 100 },
  "byModule": { "connectivity": 300, "database": 500, "http": 600, ... },
  "byStatus": { "success": 1300, "failure": 200 },
  "failureRate": 13.33,
  "avgDuration": 42,
  "topErrors": [
    { "module": "connectivity", "action": "test-connection", "count": 45 }
  ],
  "throughput": [
    { "timestamp": "04:20", "count": 15 },
    { "timestamp": "04:21", "count": 22 }
  ]
}
```

### Log File Rotation

- Written to `logs/app-YYYY-MM-DD.log` (one file per day)
- In-memory ring buffer holds last 2000 entries for fast API queries
- No external dependencies — uses built-in `fs.appendFile`

### To Integrate with Grafana

Point Grafana's JSON API data source to:
- `http://localhost:3000/api/logs/recent` — raw log entries
- `http://localhost:3000/api/logs/stats` — aggregated metrics
- Or tail the JSONL files with Promtail → Loki → Grafana

## To make cards show real data
1. In Source Connectivity, add an RDBMS connection (PostgreSQL/MSSQL) with real host/port/credentials
2. Set each binding's `connectionId` to the new connection instead of `sis-production`
3. Cards will then pull data from the live database

## Remaining Work
- Views other than Academics and Finances still use hardcoded/empty constants
- Each view needs `execute-card-query` integration (read bindings, resolve connection, fetch data)
- Currently only Academics and Finances have full SQL-driven data flow
