# TrueSpend - Privacy-First Budgeting SaaS

A lightweight, CSV-based personal budgeting application built with Next.js and Supabase.

Built with Next.js, Supabase, and Vercel.

## 🚀 Features

- 🔐 Passwordless authentication (Magic Link)
- 📁 CSV transaction import
- 🗂 Custom categories
- ⚙️ Rule-based auto-categorization
- 💰 Monthly budgeting
- 📈 Spending dashboard
- 🔍 Search & filter transactions
- 🛡 Row Level Security (RLS)
- 🌍 Privacy-first (no bank connections)

## 🧱 Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | Next.js 14 (App Router) |
| Authentication | Supabase Auth |
| Database | Supabase (PostgreSQL + RLS) |
| AI | OpenAI API (stubbed for MVP) |
| Styling | Tailwind CSS |
| Hosting (planned) | Vercel |
| Charts | Recharts |
| Forms | React Hook Form |

## 📁 Project Structure

```bash
/app 
    /(auth) 
    /dashboard 
    /import 
    /transactions 
    /budgets 
    /settings

/lib 
    /supabase 
    /csv 
    /rules 
    /budgets

/components 
/types
```

## ⚙️ Requirements

- Node.js 18+
- Supabase account
- Vercel account (optional)

## 🔧 Installation

### 1.  Clone Repository

```bash
  git clone https://github.com/your-username/your-repo.git 
  cd your-repo
```

### 2.  Install Dependencies

```bash
  npm install
```

### 3.  Configure Environment

Create .env.local:

```bash
  NEXT_PUBLIC_SUPABASE_URL=your_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Link Supabase Project

```bash
  supabase login
  supabase link --project-ref your_project_ref_id
```

Find your project reference ID in Project Settings → General

### 5. Generate TypeScript Types

```bash
npm run types:generate
```

Restart server after changes.

## 🗄 Database Setup

1. Create a Supabase project
2. Run SQL migrations from /migrations
3. Enable Row Level Security
4. Verify triggers and policies

## 🔐 Authentication Setup

Uses Supabase Magic Links.

Ensure redirect URLs are configured in Supabase Dashboard:

```text
  https://yourdomain.com/dashboard 
  http://localhost:3000/dashboard
```

## 📥 CSV Import Flow

1. Upload CSV file
2. Map columns
3. Preview data
4. Normalize values
5. Apply rules
6. Deduplicate
7. Insert into database

Supported fields:

- Date
- Description
- Amount
- Category (optional)
- Balance (optional)

## 🗂 Categorization Rules

Rules are evaluated in order:

1. Manual overrides
2. User rules
3. System defaults
4. Uncategorized


Example rule:

```text
IF description CONTAINS "STARBUCKS" → Food
```

## 💰 Budgeting System

Budgets are set per category per month.

```text
Monthly Spend = SUM(transactions.amount)
```

Features:

- Progress indicators
- Overspend alerts
- Monthly comparisons

## 🔒 Security

- Row Level Security enabled on all tables
- HTTPS enforced
- No plaintext credentials
- Per-user isolation

## 📊 Performance Targets
    
| Area | Target |
| :--- |  ---: |
| Import (10k rows) | \< 30s |
| Dashboard Load | \< 1.5s |
| Query Time | \< 100ms |

## 📦 Deployment

Vercel
1. Push to GitHub
2. Connect repo to Vercel
3. Configure environment variables
4. Deploy

```dash
vercel --prod
```

## 💳 Monetization (Planned)

| Tier | Price | Features |
| Free | \$0 | Limited history |
| Pro | \$6/mo | Unlimited |
| Family | \$9/mo | Shared |

## 🛣 Roadmap

### Phase 1

- Auth
- CSV Import
- Transactions
- Categories
- Dashboard

### Phase 2

- Rules Engine
- Budgets
- Stripe
- Reports

### Phase 3

- PWA
- AI Categorization
- Sharing

## 🤝 Contributing

1. Fork repo
2. Create feature branch
3. Commit changes
4. Open PR

## 📬 Support

For issues or questions:

- Open a GitHub Issue
- Contact: support@yourdomain.com

## 📜 License

MIT License

---

Built with focus on simplicity, privacy, and control.
