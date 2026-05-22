# 🐝 HonestBee Clone — React + Supabase

A full-stack HonestBee-inspired grocery & food delivery web app built with **React** and **Supabase**.

---

## 📁 Project Structure

```
honestbee/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── Navbar.css
│   ├── hooks/
│   │   ├── useAuth.js       ← Customer login state
│   │   └── useCart.js       ← Shopping cart state
│   ├── lib/
│   │   └── supabase.js      ← Supabase client
│   ├── pages/
│   │   ├── Home.jsx / .css        ← Landing page
│   │   ├── Shop.jsx / .css        ← Product listing + Add to cart
│   │   ├── Cart.jsx / .css        ← Cart + Checkout flow
│   │   ├── Auth.jsx / .css        ← Login & Register
│   │   ├── Orders.jsx / .css      ← My Orders + Details
│   │   ├── Vendors.jsx            ← Vendor listing
│   │   ├── Track.jsx / .css       ← Order tracking by ID
│   │   └── Admin.jsx / .css       ← Full Admin CRUD Dashboard
│   ├── styles/
│   │   └── globals.css            ← Design system / tokens
│   ├── App.js
│   └── index.js
├── supabase_schema.sql   ← ⭐ Run this in Supabase SQL Editor first!
├── .env.example
└── package.json
```

---

## 🗄️ Database (ERD Tables)

Matches the ERD from the case study exactly:

| Table        | Primary Key    | Description                          |
|-------------|---------------|--------------------------------------|
| customer     | customer_id   | Registered users                     |
| vendor       | vendor_id     | Partner stores / restaurants         |
| product      | product_id    | Items sold by vendors                |
| orders       | order_id      | Customer orders                      |
| order_item   | orderitem_id  | Line items within an order           |
| payment      | payment_id    | Payment record per order             |
| shopper      | shopper_id    | Shopper Bee delivery personnel       |
| delivery     | delivery_id   | Delivery assignment per order        |

---

## 🚀 Setup Instructions

### Step 1 — Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click **New Project** → fill in name and password → Create
3. Wait for it to provision (~1 minute)

### Step 2 — Run the SQL Schema

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Open `supabase_schema.sql` from this project
4. Paste all contents into the editor
5. Click **Run** (▶)

This creates all 8 tables with proper constraints, RLS policies, and seed data.

### Step 3 — Get Your API Keys

1. In Supabase dashboard → **Settings** → **API**
2. Copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon / public key** (long JWT string)

### Step 4 — Configure Environment

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Edit `.env.local` and paste your keys:
   ```
   REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Step 5 — Install & Run

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🧭 Pages & Features

| Route       | Page           | Features                                              |
|------------|----------------|-------------------------------------------------------|
| `/`         | Home           | Hero, categories, featured products, vendors, CTA    |
| `/shop`     | Shop           | Browse all products, filter by category & vendor     |
| `/cart`     | Cart           | Manage cart, checkout, place order with payment      |
| `/login`    | Login          | Customer authentication                              |
| `/register` | Register       | New customer sign-up                                 |
| `/orders`   | My Orders      | View order history, delivery & payment details       |
| `/vendors`  | Vendors        | Browse all partner stores                            |
| `/track`    | Track Order    | Real-time order tracking by order ID                 |
| `/admin`    | Admin Dashboard| Full CRUD for all 8 database tables + stats          |

---

## 🔑 Test Credentials (from seed data)

| Email              | Password    | Name                    |
|-------------------|-------------|-------------------------|
| shaun@email.com   | password123 | Shaun Michael Catalla   |
| maria@email.com   | password123 | Maria Clara Dela Cruz   |
| jose@email.com    | password123 | Jose Rizal Gomez        |

---

## 🛠️ Tech Stack

- **React 18** with React Router v6
- **Supabase** (PostgreSQL + REST API)
- **Lucide React** for icons
- **Google Fonts** — Syne (display) + DM Sans (body)
- Pure CSS (no Tailwind, full custom design system)

---

## 📌 Subject Info

- **Subject:** IMDBSYS32
- **Student:** Shaun Michael C. Catalla
- **Schedule:** SAT 4:30–7:30PM LEC / 7:30–9:30PM LAB
- **Date:** April 24, 2026
