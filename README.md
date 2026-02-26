# Snag

**Turn any website into a REST API in seconds, powered by Artificial Intelligence.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue)](https://neon.tech)

---

## Overview

Snag is a web platform that uses AI (Playwright + LLM) to analyze web pages and automatically generate custom REST endpoints. No manual configuration, no boilerplate — paste a URL and get a working API in seconds.

---

## Features

- AI-powered analysis that automatically detects relevant page elements
- Full support for SPAs and JavaScript-rendered content via Playwright
- Instant REST endpoint generation, ready for production
- GitHub OAuth authentication via NextAuth.js
- Credit-based usage system - $30 USD initial credits per user
- Real-time platform statistics and visitor analytics
- User management - Admin panel for credit management
- Usage limits - 3 endpoints per user, 1000 requests per endpoint
- Serverless PostgreSQL storage via Neon

---

## Tech Stack

| Layer       | Technology                                      |
|-------------|-------------------------------------------------|
| Frontend    | Next.js 15, TypeScript, Tailwind CSS, HugeIcons |
| Backend     | FastAPI, Python 3.11+, SQLAlchemy (async)        |
| Scraping    | Playwright, BeautifulSoup                        |
| AI Provider | Z-AI (GLM-4.5)                                   |
| Database    | PostgreSQL (Neon)                                |
| Auth        | NextAuth.js, GitHub OAuth                        |

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- Python 3.11 or later
- A [Neon](https://neon.tech) account (optional — SQLite is used by default)
- A GitHub OAuth App

### 1. Clone the repository

```bash
git clone https://github.com/dsantillanAb/snag.git
cd snag
```

### 2. Backend setup

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
playwright install chromium

cp ../.env.example .env
# Edit .env with your credentials
```

Start the development server:

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Run the credits system migration

**Important:** After starting the backend for the first time, run the migration to add the credits system:

```bash
# In a new terminal, with venv activated
cd backend
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

python migrate_postgres.py
```

This will:
- Add credits columns to the database
- Give $30 USD to all existing users
- Set `dsantillanAb` as the super administrator

### 5. Frontend setup

```bash
cd frontend
npm install

cp ../.env.example .env.local
# Edit .env.local with your credentials

npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Copy `.env.example` to `.env` (backend) and to `frontend/.env.local`, then fill in the required values.

| Variable               | Description                                  |
|------------------------|----------------------------------------------|
| `DATABASE_URL`         | PostgreSQL connection string                 |
| `AI_API_KEY`           | API key for the AI provider                  |
| `SECRET_KEY`           | Secret key used for JWT signing              |
| `GITHUB_CLIENT_ID`     | Client ID of your GitHub OAuth App           |
| `GITHUB_CLIENT_SECRET` | Client secret of your GitHub OAuth App       |
| `NEXTAUTH_SECRET`      | Secret key for NextAuth.js session signing   |
| `NEXTAUTH_URL`         | Base URL of the frontend application         |

---

## API Reference

### Public Endpoints

| Method | Route                                  | Description                  |
|--------|----------------------------------------|------------------------------|
| GET    | `/api/v1/health`                       | Server health check          |
| GET    | `/api/v1/endpoints/scrape/{slug}`      | Run a scraping endpoint      |
| GET    | `/api/v1/stats/`                       | Platform statistics          |
| POST   | `/api/v1/scraper/analyze`              | Analyze a URL with AI        |
| POST   | `/api/v1/auth/github`                  | Sync a GitHub user           |

### User Management (Authenticated)

| Method | Route                                  | Description                  |
|--------|----------------------------------------|------------------------------|
| GET    | `/api/v1/users/me`                     | Get current user profile     |
| GET    | `/api/v1/users/me/endpoints`           | Get user's endpoints usage   |
| GET    | `/api/v1/users/admin/all`              | List all users (admin only)  |
| POST   | `/api/v1/users/admin/add-credits`      | Add credits to user (admin)  |

Full interactive documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs) when running locally.

---

## Credits System

### Overview

Each user receives **$30 USD** in credits upon registration. Credits are consumed with each API request:

- **Cost per request:** $0.03 USD
- **Maximum endpoints per user:** 3
- **Maximum requests per endpoint:** 1,000
- **Total requests with initial credits:** ~1,000 requests

### Usage Tracking

Users can monitor their usage through the profile page:
- **Profile Tab:** View credits balance and statistics
- **Endpoints Tab:** See request count and credits used per endpoint
- **Usage Tab:** Detailed breakdown of credit consumption

### Admin Features

The super administrator (`dsantillanAb`) has access to:
- View all users and their usage
- Add credits to any user
- Monitor system-wide statistics

### Error Messages

- **403:** "Has alcanzado el límite de 3 endpoints"
- **402:** "Créditos insuficientes. Has agotado tu saldo."
- **402:** "Has agotado el límite de 1000 requests para este endpoint"

---

## Author

**Daniel Santillán**
- GitHub: [@dsantillanAb](https://github.com/dsantillanAb)

---

## License

This project is licensed under the [MIT License](./LICENSE).
