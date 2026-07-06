# Holland Residences — 34 Holland St, Toowong

Premium boutique property website for Holland Residences — a collection of nine luxury residences in Brisbane's inner-west.

## Features

- **Responsive Design** — Premium aesthetic across all devices
- **Contact Form** — Supabase-backed with secure data storage
- **Spam Protection** — Honeypot field blocks bot submissions
- **Campaign Tracking** — UTM parameter capture on every enquiry
- **Social Sharing** — Open Graph + Twitter Card meta tags for rich previews
- **Analytics Ready** — Google Analytics & Meta Pixel placeholders
- **SEO Optimised** — robots.txt, sitemap.xml, semantic HTML, meta descriptions
- **Image Optimised** — Web-compressed photos for fast page loads

## Setup

### 1. Supabase (Contact Form Database)

1. Create a free project at [supabase.com](https://supabase.com)
2. Run this SQL in the Supabase SQL Editor to create the enquiries table:

```sql
CREATE TABLE enquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    interest TEXT,
    message TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_content TEXT,
    utm_term TEXT,
    referrer TEXT,
    page_url TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts only (visitors can submit but can't read other submissions)
CREATE POLICY "Allow anonymous inserts" ON enquiries
    FOR INSERT TO anon
    WITH CHECK (true);
```

3. Go to Settings → API and copy your **Project URL** and **anon key**
4. Paste them into `script.js` (lines 14-15)

### 1a. Lead-source attribution (required before merging direct-sales-mode)

Run this once in the Supabase SQL Editor:

```sql
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS lead_ref TEXT;
```

Each team member shares their own link — the first `ref` a visitor arrives
with is remembered in their browser and attached to every enquiry they
submit later (first touch wins):

- `https://ehmbuild.com.au/?ref=harrison`
- `https://ehmbuild.com.au/?ref=suzy`

Works combined with campaign UTMs, e.g. `/?ref=harrison&utm_source=instagram`.
Phone enquiries have no automatic attribution — ask the caller how they
heard about the property and record it in the lead register.

### 2. Hosting (GitHub Pages)

This site is deployed via GitHub Pages. Push to `main` and enable Pages in repo settings.

### 3. Analytics (Optional)

Uncomment the Google Analytics and/or Meta Pixel scripts at the bottom of `index.html` and replace the placeholder IDs with your own.

## Development

Open `index.html` directly in a browser, or use any local server:

```bash
npx serve .
```

## Built by

HEM Developments
