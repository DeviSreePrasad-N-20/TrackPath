# 🎯 TrackPath: Longitudinal Skilling Outcomes Intelligence Platform

> **A privacy-conscious, low-burden longitudinal tracking platform** that links consent-based trainee records with employment signals, employer validation, wage progression, skill gap diagnostics, and automated remedial interventions.

---

## 🚀 Key Features & Three Interconnected Portals

### 1. 👤 Trainee Portal (`/trainee`)
- **Self-Reported Check-ins:** 30-second low-burden updates for employment status, role, and monthly salary bands.
- **Outcome Journey Tracker:** Visual milestone stepper from training completion to 12-month retention.
- **Explicit Consent Management:** Trainees control tracking consent at any time.

### 2. 🏢 Employer Portal (`/employer`)
- **Lightweight Verification:** Fast, low-friction confirmation of working status, tenure, and approximate wage bands.
- **Bulk CSV Upload:** Batch validation for enterprise partners.
- **Industry Skill Demand Feedback:** Submits real-world skill demand signals to feed the curriculum intelligence engine.

### 3. 📊 Admin Intelligence Portal (`/admin`)
- **Longitudinal Retention Funnel:** Step-by-step cohort retention analysis from enrolment to 12-month retention.
- **Wage Progression Analytics:** Tracks salary growth trajectories over time.
- **Regional Skill Gap Matrix:** Triangulates employer demands against test proficiencies.
- **Automated Early Warning & Intervention Engine:** Dispatches micro-learning remedial modules via WhatsApp & LMS.
- **Nudge Engine:** 1-click WhatsApp follow-up reminders.
- **Government Policy Exporter:** Instant CSV download of longitudinal outcome benchmarks.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Chart.js, Lucide Icons, React Router v7.
- **Backend:** Node.js, Express, Better-SQLite3, JSON Web Tokens (JWT).
- **Security:** End-to-end Role-Based Access Control (RBAC), Differential Privacy reporting.

---

## ⚡ Quick Start (Local Setup)

```bash
# 1. Install dependencies & build
npm run build

# 2. Start the unified server
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser.

---

## 🔑 Demo Access Credentials

| Portal | Role | URL | Username / ID | Password |
| :--- | :--- | :--- | :--- | :--- |
| **Admin Portal** | Administrator | `/admin` | `admin` | `admin123` |
| **Trainee Portal** | Trainee | `/trainee` | `trainee_demo` | `demo123` |
| **Employer Portal** | Employer | `/employer` | `employer_demo` | `demo123` |

---

## 📦 Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for 1-click deployment guides for **Render**, **Railway**, **Vercel**, and **Docker**.
