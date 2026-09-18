# Leadyfy OS

Internal Agency Management & Operations SaaS for UGC & Digital Marketing Agencies.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS (dark amber theme)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js v5 (JWT + RBAC)
- **State**: React Query + Zustand

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/mrityunjay45108/Leadify_os-.git
cd leadyfy-os
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/leadyfy_os"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Setup Database

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Default Login Credentials

| Role     | Email                   | Password  |
|----------|-------------------------|-----------|
| Owner    | owner@leadyfy.com       | admin123  |
| Admin    | admin@leadyfy.com       | admin123  |
| Employee | writer@leadyfy.com      | admin123  |
| Client   | client@brand.com        | admin123  |

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login page
│   ├── (dashboard)/      # Internal team views
│   │   ├── dashboard/
│   │   ├── clients/
│   │   ├── orders/
│   │   ├── scripts/
│   │   ├── creators/
│   │   ├── shoots/
│   │   ├── videos/
│   │   ├── financials/
│   │   ├── employees/
│   │   └── tasks/
│   ├── (client-portal)/  # Client-facing portal
│   └── api/              # REST API routes
├── components/
├── lib/
└── middleware.ts          # RBAC route protection
```

## Operational Lifecycle

```
Lead → Onboarding → Package/Order → Client Review → Revisions → Scripting → Creator Match → Shoot → Editing → Final Delivery → Payout & Reports
```

## User Roles

- **Owner** — Full system access, financials, RBAC config
- **Admin** — Operational admin, team management, reports
- **Employee** — Role-specific views (writer, editor, shoot manager, sales)
- **Client** — Isolated portal, script approval, video review, invoices
