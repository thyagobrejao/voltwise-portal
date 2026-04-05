# VoltWise Portal

Web interface for managing the VoltWise EV charging platform for the hospitality industry.

## ✨ Features

- **Landing page** — Marketing page with hero, features, how it works, benefits, and CTA sections
- **Authentication** — Login and registration with validation and JWT session persistence
- **Dashboard** — Overview with KPIs, recent activity, and charger status summary
- **Charger management** — Searchable table with status filters and per-row actions
- **Charging sessions** — History with filters, energy summary, and cost breakdown
- **Settings** — Profile, organization, notifications, and security in tabbed layout
- **Multi-language** — Full support for Portuguese and English (PT default)

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Build | Vite 5 |
| Language | TypeScript |
| Routing | Vue Router 4 |
| State | Pinia 2 |
| Styling | TailwindCSS 3 |
| i18n | Vue I18n 9 |
| HTTP | Axios |
| Icons | Heroicons v2 |

## 🚀 Development

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Production build
npm run build

# TypeScript type checking
npm run type-check
```

### Demo credentials

```
Email:    admin@voltwise.com
Password: password123
```

## ⚙️ Configuration

Copy `.env.example` to `.env` and set the variables:

```bash
VITE_API_URL=http://localhost:8000
```

In development, Vite proxies `/api` requests to `localhost:8000` automatically.

## 🔗 Backend

Consumes the **voltwise-cloud** REST API. In development, the service layer (`src/services/api.ts`) uses mock data with a simulated delay — no backend required to run the portal locally.

## 📁 Structure

```
src/
├── locales/          # PT and EN translation files
├── router/           # Public and protected routes
├── stores/           # Pinia: auth, chargers, sessions
├── services/         # Axios instance + service layer
├── layouts/          # PublicLayout and DashboardLayout
├── components/       # Reusable UI + landing + dashboard components
├── pages/            # Landing, auth, and dashboard pages
└── styles/           # Tailwind layers + custom utilities
```

See [`voltwise-docs/portal/architecture.md`](../voltwise-docs/portal/architecture.md) for full architecture documentation.

## 📄 Licença

AGPL v3
