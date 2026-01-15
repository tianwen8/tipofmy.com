# TipOfMy.com — Smart Portal

> **Find what you can't name.**  
> A minimalist portal helping users find movies, books, games, and music by describing the plot or vibe.

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Status](https://img.shields.io/badge/status-beta-orange.svg)

## 🚀 Current Status (2026-01-15)

### ✅ Completed Features
- **Core Functionality**
  - **Movies (Live):** Integrated redirection to [FindByVibe.com](https://findbyvibe.com) with smart query validation and UTM tracking.
  - **Waitlist System:** Functional sign-up forms for Books, Games, and Music categories.
  - **Email Notifications:** Live API route (`/api/waitlist`) using **Resend**. Notifications are sent directly to `x253400489@gmail.com`.
  - **Simulation Mode:** Local fallback that logs sign-ups to the terminal if the API key is missing.

- **UI/UX Design (Apple Style)**
  - **Glassmorphism:** Frosted glass panels, subtle gradients, and soft shadows.
  - **Segmented Control:** iOS-style animated tabs with sliding background.
  - **Micro-interactions:** Smooth transitions, active states, and loading animations.
  - **Responsive:** Optimized for both desktop and mobile devices.

- **Tech Stack**
  - Framework: Next.js 14 (App Router)
  - Styling: Tailwind CSS
  - Icons: Lucide React
  - Language: TypeScript

### 🚧 To Do / Configuration
- [x] **Configure Recipient:** Email notifications set to `x253400489@gmail.com`.
- [ ] **Domain Setup (Resend):** Add your custom domain to Resend dashboard to remove the `onboarding@resend.dev` sender tag.
- [ ] **Deployment:**
  - Deploy to **Vercel** (Recommended for Next.js).
  - Configure Custom Domain (`tipofmy.com`).
  - Add `RESEND_API_KEY` to Vercel environment variables.
- [ ] **Database (Future):**
  - Enable Supabase integration when traffic scales (SQL schema provided in `supabase_setup.sql`).

---

## 🛠️ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Rename or create `.env.local`:
```env
RESEND_API_KEY=re_your_api_key_here
```
*Note: Also update the `to:` email address in `src/app/api/waitlist/route.ts`.*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the portal.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/waitlist/   # Email notification endpoint
│   │   ├── page.tsx        # Main single-page application
│   │   ├── layout.tsx      # Root layout & Metadata
│   │   └── globals.css     # Global styles & Tailwind
│   └── lib/                # Utilities
├── public/                 # Static assets
├── supabase/               # Edge functions (Optional/Future)
├── supabase_setup.sql      # Database schema (Optional/Future)
└── plan.md                 # Original dev specification
```

## 📝 License
This project is for internal development.
