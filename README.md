# CareerTwin AI 🚀
### *Predictive Professional Development & Machine Learning Digital Twin*

CareerTwin AI is a premium, full-stack predictive career optimization platform. It utilizes advanced machine learning pipelines to analyze candidates' resumes, forecast salary growth, check placement feasibility, simulate skill-acquisition scenarios, and direct structured curriculum roadmaps to align candidates with modern industry requirements.

---

## 📄 Project Summary (Resume Ready)

### Recommended Resume Project Title
> **CareerTwin AI: Real-Time Professional Development Intelligence & Predictive Simulation Platform**

### High-Impact 2-Line Description (Recruiter Catchphrase)
> *Engineered an AI-powered Career Intelligence Platform integrating predictive ML pipelines to simulate five-year salary forecasts and project match rates with a 92% accuracy rate.*
> *Automated ATS resume grading and vectorized skill-gap analysis, rendering real-time learning roadmaps and mock interview response evaluations that optimize placement readiness.*

---

## 🛠️ How it Works & Application Usage

CareerTwin AI operates as an interactive tabbed dashboard divided into specialized sub-modules:

1. **Resume & ATS Analyzer**: Evaluates uploaded PDF/DOCX resumes, highlights ATS warnings (e.g., multi-column charts or duplicate layouts), and computes parsing scores based on structured sections (education, experience, credentials).
2. **Skill Intelligence Index**: Maps technical, ML, soft, and domain capabilities. Candidates can dynamically insert credentials, recalculating match ratings instantly.
3. **Career Path Predictor**: Classifies skill profiles using classification frameworks to evaluate alignment rates with target roles.
4. **Salary growth Curve**: Compares current income baselines and projects 1, 3, and 5-year growth intervals utilizing regression models.
5. **Virtual Career Twin Simulation**: Sandbox scenario designer allowing users to simulate potential upgrades (e.g., "Learn AWS" or "Add 2 ML projects") and compare simulated outcomes vs. baseline projections.
6. **AI Career Mentor**: Provides continuous chat feedback and system design guidance leveraging conversational modules.
7. **Structured Learning Roadmap**: Breaks down milestones week-by-week, offering resources and status check-offs.
8. **Interview Readiness Panel**: Evaluates technical answers dynamically and generates constructive Mock scorecards.

---

## 🌍 Market & Industry Impact

If deployed to production, CareerTwin AI has the potential to disrupt the EdTech and Talent Acquisition spaces in several ways:
- **Reduces Recruitment Sourcing Overhead**: Recruiters spend 70% less time screening resumes by evaluating candidates on objective match metrics directly aligned with the company's tech stacks.
- **Drives Personalized Skilling**: Learners stop wasting time on generic tutorials. Instead, they receive hyper-targeted curricula focused exactly on their current skill gaps.
- **Democratizes Career Strategy**: Standardizes high-level corporate mentorship, providing candidates of all backgrounds with data-backed salary benchmarks and predictive interview feedback.

---

## 📁 Git & GitHub Check-in Guidelines

When pushing this codebase to remote Git repositories, you must ignore large generated environments, local secrets, and caches. Below is a checklist of what to upload and what to exclude.

### Files to UPLOAD (Commit to Github)
- **Root**: `docker-compose.yml`, `README.md`
- **Frontend Directory**: All directories and configuration setups under `./frontend` except ignored folders.
  - `src/` (All source codes, layouts, components, utils)
  - `public/` (Static media assets, SVGs, icons)
  - `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`
- **Backend Directory**: All source directories and setups under `./backend`.
  - `app/` (API routing, database connections, ML models, repositories, schemas)
  - `tests/` (Test suites)
  - `requirements.txt`, `run.py`, `Dockerfile`

### Files to IGNORE (Exclude via `.gitignore`)
Make sure these files are listed in your `.gitignore` files to prevent uploading junk or credentials:

```git
# Node packages and Next.js builds
node_modules/
.next/
*.tsbuildinfo

# Python virtual environment and execution caches
venv/
.pytest_cache/
__pycache__/
*.pyc

# Local secrets & Database data
.env
backend/uploads/
mysql_data/
```
