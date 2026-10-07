# Order Tracker - Nihawi Puan & Cake-A-Licious

A mobile-friendly order tracking app for two businesses.

## 🚀 Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate PWA Icons (Required for APK)

**Option A: Using the icon generator page (Easiest)**
1. Run `npm run dev`
2. Open `http://localhost:5173/generate-icons.html` in your browser
3. Click "Download 512x512 Icon" and "Download 192x192 Icon"
4. Move the downloaded files to `public/icons/` folder
5. Rename them to `icon-512.png` and `icon-192.png`

**Option B: Using Node.js script**
```bash
node generate-icons.js
```
This will automatically generate and save the icons to `public/icons/`

### 3. Setup Supabase Database

1. Go to your Supabase project dashboard
2. Open SQL Editor
3. Run the SQL files in this order:
   - `supabase-schema.sql` (creates tables)
   - `supabase-migration-addons.sql` (adds add-ons column)
   - `supabase-migration-remove-required.sql` (removes required fields)

### 4. Deploy to Vercel

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Vercel will auto-deploy

### 5. Generate APK (Optional)

1. Go to https://www.pwabuilder.com/
2. Enter your Vercel URL
3. Click "Package for Stores" → "Android"
4. Download the APK

## 📱 Features

- **Nihawi Puan** (Sky Blue theme) - Track Mizo textile sales
- **Cake-A-Licious** (Light Pink theme) - Track cake orders
- Add customer details, contact, address, payment method
- Add-ons support for extra items/prices
- Edit existing orders
- Mark orders as complete
- Dashboard with statistics
- Works offline (PWA)

## 🎨 Themes

- **Nihawi Puan**: Sky blue gradient (`sky-400` to `sky-500`)
- **Cake-A-Licious**: Light pink gradient (`pink-300` to `pink-400`)

## 📋 Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Supabase (PostgreSQL)
- PWA (Service Worker + Manifest)
