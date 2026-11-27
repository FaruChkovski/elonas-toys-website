---
title: "Elona's Toys — Discovery Notes"
type: project
status: active
tags: [discovery, notes, elonas-toys, decisions]
last_updated: "2026-11-24"
agent_owner: hermes
related:
  - "[[00_INDEX]]"
  - "[[02_PROJECTS/elonas-toys-website/_INDEX]]"
---

# 📝 Elona's Toys — Discovery Notes

Incremental decision log for the Elona's Toys website project. Decisions are recorded here as you confirm them, one topic at a time.

## Baseline Context (from brief — not final)

- **Business:** Elona's Toys (@elonastoys), Khaldeh, Lebanon
- **Tagline:** "Your One-Stop Kids Store — Toys & Essentials — Quality You Can Trust"
- **Phone/WhatsApp:** +961 78 702 712 (delivery across Lebanon)
- **Hours:** Mon–Sun, 9:00 AM – 9:30 PM
- **Logo:** Circular white logo, orange teddy bear mascot, multicolored lettering
- **Color direction:** Purple + complementary colors
- **Core discovery:** Search by Age, Search by Category

## Topic 1: Site Structure, Wireframe & Section Order ✅ COMPLETE

- **Pages:** Home, Catalog (all toys), Product Detail, About Us, Contact, Delivery Info — all six.
- **Homepage sections:** 1. Hero banner · 2. Search by Age & Category · 3. Special Offers grid · 4. Categories grid · 5. Socials (TikTok & Instagram) · 6. Customer Feedbacks · 7. Store Location & Hours · 8. Footer
- **Search placement:** C & D — dedicated catalog page + instant search modal (both)
- **Header layout:** Logo → Core nav links → Search trigger → Cart badge → EN/AR toggle → Dark/Light toggle → WhatsApp CTA (uncluttered, desktop & mobile)
- **Mobile nav:** Hamburger menu on mobile, inline nav on desktop

## Topic 2: Visual Design, Purple Palette & UI Styling ✅ COMPLETE

- **Primary color:** Plum Purple #8E44AD ✅
- **Accent:** Gold #F1C40F + White ✅
- **Typography:** English headings/logo: Permanent Marker (handwritten); Arabic headings + body: Cairo or Lalezar; English body: clean sans-serif ✅
- **Corner radius:** Rounded corners (20px), frosted-glass cards ✅
- **Shadows:** Deep (0 16px 48px rgba(0,0,0,0.18)) ✅
- **Light mode tokens:** Background #FFFFFF, Surface/Card #F7F3FB, Border #D8C4E8, Text #2A2A2A ✅
- **Dark mode tokens:** Background #1A0B2E (Deep Purple), Surface/Card #2A1B3E, Border #6B4FA1, Text #F8F5FF, Primary #B37FE0 ✅
- **Mascot integration:** Option 1 — Hero Banner (bear next to tagline in hero section) ✅
- **Micro-animations:** All five — fade-in load, card hover lift, button press, mascot bob, search modal slide-in ✅

## Topic 3: Product Cards, Filters & Ordering Experience ✅ COMPLETE

- **Age brackets:** 0–12 Months, 1–3 Years, 3–5 Years, 6–8 Years, 9+ Years ✅
- **Categories:** Baby & Toddler, Dolls & Pretend Play, Cars & Action, Educational & STEM, Board Games & Puzzles, Outdoor & Ride-Ons, Kids Essentials ✅
- **Product card content:** All of the above — photo (bear logo placeholder until real stock pics), name, price (USD), age badge, category tag, stock status, multiple photos/video, "Add to WhatsApp" button ✅
- **Filtering behavior:** A — Instant filter (results update as you tap age, category, or keyword; no Apply button needed) ✅
- **Catalog view:** Grid view (cards) by default, with Grid/List toggle ✅
- **Ordering flow:** Guest WhatsApp checkout (no accounts), cart with item badge in header, 1-click "Copy Number (+961 78 702 712)" button, Whish Money or Pay Upon Delivery ✅
- **Theme modes:** Light mode (white bg) + Dark mode (deep purple bg) ✅

## Topic 4: Content, Social Proof & Bilingual Localization ✅ COMPLETE

- **Bilingual support:** EN/AR toggle button in header + auto-detect browser language with manual override ✅
- **RTL layout:** Full mirror (logo moves right, nav flips, layout mirrors) when Arabic is active ✅
- **Instagram Feedbacks & Reels:** Both — Customer Feedbacks section on homepage + Instagram Reels showcase ✅
- **Store location & delivery:** Dedicated "Delivery Info" page linked from header ✅
- **Brand copy tone:** Playful & fun ("Toys that spark joy, one bear hug at a time") ✅
- **Cart system:** Guest WhatsApp checkout (no accounts) ✅
- **Payment methods:** Whish Money (to +961 78 702 712) or Pay Upon Delivery ✅

## Topic 5: Tech Stack, Performance & Deployment ✅ COMPLETE

- **Tech stack:** Static HTML + vanilla JS (no build step), products in a JSON file, Netlify/Vercel hosting (free tier) ✅ *(recommended stack)*
- **Product-updating workflow:** Edit a JSON file to add new toys ✅

---
