# Aegis LifeOps - Unified Life Operations & Priority Command Center

Aegis LifeOps consolidates scattered personal bills, renewals, document expiries, maintenance tasks, subscriptions, and appointments into a single explainable command center.

---

## Database & SQL Workbench Setup Guide

You can run your database using **SQL Workbench** (MySQL Workbench, DBeaver, pgAdmin, or SQL Workbench/J) using two options:

### Option 1: Connect SQL Workbench / DBeaver directly to Supabase Postgres (Recommended)

1. Open your Supabase Dashboard → **Project Settings** → **Database**.
2. Find your Connection String under **Database Settings**:
   - **Host**: `db.<your-project-ref>.supabase.co`
   - **Port**: `5432` (or `6543` for connection pooling)
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: *(Your Supabase Database Password)*
3. In **SQL Workbench / DBeaver / pgAdmin**:
   - Create a new **PostgreSQL Connection**.
   - Enter the Host, Port, User, and Password details above.
   - Open a new Query Window, paste the contents of `sql/schema.sql` (or `supabase/migrations/20260929000000_aegis_lifeops_init.sql`), and click **Execute All Statements**.

---

### Option 2: Run in MySQL Workbench (Local / Cloud MySQL Server)

If you are using **MySQL Workbench** with a local MySQL server:

1. Launch **MySQL Workbench** and connect to your local MySQL instance.
2. Open the SQL script file `sql/mysql_schema.sql`.
3. Click the ⚡ **Execute** lightning bolt icon to create the `aegis_lifeops` database and all 4 tables (`users`, `obligations`, `proofs`, `notice_drafts`).

---

## Features & Highlights

1. **Dashboard & Explainable Plan**: Real-time "What Should I Do Next?" master action recommendation based on priority score, deadline urgency, consequence severity, and prerequisite dependencies.
2. **Smart Notice Inbox**: Transparent rule-based extraction engine (Regex + Keywords, labeled honestly without false AI claims) parsing pasted notices into editable drafts with robust date extraction.
3. **Comprehensive Directory & CRUD**: Full add, edit, search, multi-filter (category, status, priority, timeframe), sorting (priority score, due date, amount, title), and deletion across 8 core categories.
4. **Explainable Priority Scoring**: Transparent 0-100 score with step-by-step mathematical rationale breakdown ("Why this score?").
5. **Redesigned Multi-View Calendar**: Month Grid, 7-day Week schedule, and Agenda feed views with colored category markers.
6. **Prerequisite Dependency Flow**: Visual node graph identifying prerequisite blockers with cycle detection.
7. **Status Workflow & Self-Reported Proof**: `Pending` → `In Progress` → `Awaiting Proof` → `Completed` workflow with self-reported receipt attachment disclosure and prerequisite completion enforcement.
8. **In-App Alerts & One-Click Demo Reset**: Urgent deadline drawers and instant Reset Demo button available on both desktop and mobile.

---

## Tech Stack
- **Framework**: React 18 + Vite 5
- **Database**: Supabase Postgres / MySQL (via SQL Workbench)
- **Icons**: Lucide React
- **Styles**: Custom Premium Responsive CSS (Deep Navy `#0B132B`, Warm Slate `#F8FAFC`, Teal `#0D9488`, Lime `#84CC16`)

---

## Local Development Commands

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Build for production
npm run build
```

---

## Exact Vercel Deployment Steps

1. Push your repository to **GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Deploy Aegis LifeOps with SQL Workbench support"
   git branch -M main
   git remote add origin https://github.com/<your-username>/aegis-lifeops.git
   git push -u origin main
   ```
2. In Vercel, click **Import Project** and select your repository.
3. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables in Vercel Dashboard:
   - `VITE_SUPABASE_URL` = `https://your-project-ref.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-public-key`
5. Click **Deploy**.
