---
title: "Elona's Toys — Website Spec"
type: project
status: completed
tags: [spec, blueprint, elonas-toys, website]
last_updated: "2026-11-24"
agent_owner: hermes
related:
  - "[[00_INDEX]]"
  - "[[02_PROJECTS/elonas-toys-website/_INDEX]]"
  - "[[02_PROJECTS/elonas-toys-website/DISCOVERY_NOTES]]"
---

# 📋 Elona's Toys — Website Specification

**Final blueprint compiled from all 5 discovery topics. Ready for your review.**

---

## 1. Business Baseline

| Field | Value |
|-------|-------|
| Business Name | Elona's Toys |
| Handle | @elonastoys |
| Category | Local Toy & Kids Essentials Store |
| Tagline | "Your One-Stop Kids Store — Toys & Essentials — Quality You Can Trust" |
| Location | Khaldeh, facing/beside Rammal Supermarket (QFPH+QQV, Khalde), Lebanon |
| Phone / WhatsApp | +961 78 702 712 |
| Delivery | Available across Lebanon |
| Hours | Monday – Sunday, 9:00 AM – 9:30 PM |
| Logo | Circular white logo, orange teddy bear mascot, multicolored lettering |
| Brand tone | Playful & fun ("Toys that spark joy, one bear hug at a time") |

---

## 2. Site Structure & Wireframe

### Pages (6)
1. Home
2. Catalog (all toys)
3. Product Detail
4. About Us
5. Watchlist
6. Delivery Info

### Homepage Section Order (top to bottom)
1. Hero banner (logo + tagline + CTA + teddy bear mascot)
2. Search by Age & Category
3. Special Offers grid
4. Categories grid
5. Socials (TikTok & Instagram)
6. Customer Feedbacks
7. Store Location & Hours
8. Footer

### Search Placement
- Dedicated catalog page (filter + results on one page)
- Instant search modal (click search icon → overlay opens)

### Header Layout (desktop & mobile — uncluttered)
Logo → Core nav links → Search trigger → Cart badge → EN/AR toggle → Dark/Light toggle → WhatsApp CTA

### Navigation
- Desktop: inline nav links
- Mobile: hamburger menu

---

## 3. Visual Design

### Color Palette — Light Mode
| Role | Hex | Usage |
|------|-----|-------|
| Primary | #8E44AD | Plum Purple — buttons, headings, accents |
| Accent | #F1C40F | Gold — CTAs, highlights |
| Background | #FFFFFF | White |
| Surface / Card | #F7F3FB | Tinted frosted-glass card |
| Border | #D8C4E8 | Light purple tinted border |
| Text | #2A2A2A | Body text |

### Color Palette — Dark Mode
| Role | Hex | Usage |
|------|-----|-------|
| Background | #1A0B2E | Deep Purple |
| Surface / Card | #2A1B3E | Tinted frosted-glass card |
| Border | #6B4FA1 | Visible purple tinted border |
| Text | #F8F5FF | Light text |
| Primary | #B37FE0 | Lighter purple for accents |
| Accent | #F1C40F | Gold — CTAs, highlights |

### Mascot Orange (reference)
#F97316 — teddy bear (used in hero banner, not as site color)

### Typography
- English headings / Logo: Fredoka (chunky, rounded, playful)
- Arabic headings + body: Cairo or Lalezar (playful, polished, RTL-friendly)
- English body: Clean sans-serif (system fonts)

### UI Styling
- Corner radius: 20px (rounded)
- Cards: Frosted-glass, deep shadow (0 16px 48px rgba(0,0,0,0.18))
- Theme modes: Light (white bg) + Dark (deep purple bg)
- Mascot: Hero banner (teddy bear next to tagline)
- Micro-animations: All five — fade-in load, card hover lift, button press, mascot bob, search modal slide-in

---

## 4. Product Cards & Ordering

### Age Brackets (exact)
- 0–12 Months
- 1–3 Years
- 3–5 Years
- 6–8 Years
- 9+ Years

### Categories (exact)
- Baby & Toddler
- Dolls & Pretend Play
- Cars & Action
- Educational & STEM
- Board Games & Puzzles
- Outdoor & Ride-Ons
- Kids Essentials

### Product Card Content
- Photo (bear logo placeholder until real stock pics)
- Product name
- Price (USD)
- Age badge (from brackets above)
- Category tag (from categories above)
- Stock status (In Stock / Low Stock / Out of Stock)
- Multiple photos or short video
- "Add to WhatsApp" button

### Filtering
- Instant filter (Age + Category + Keyword, results update immediately, no Apply button)

### Catalog View
- Grid view (cards) by default, with Grid/List toggle

### Ordering Flow
- Guest WhatsApp checkout (no accounts, frictionless)
- Cart with item badge in header
- 1-click "Copy Number (+961 78 702 712)" button in checkout flow
- Payment: Whish Money (to +961 78 702 712) or Pay Upon Delivery

---

## 5. Content, Social Proof & Localization

### Bilingual
- EN / AR toggle button in header
- Auto-detect browser language with manual override
- Full RTL mirror when Arabic is active (logo moves right, nav flips)

### Instagram
- Customer Feedbacks section on homepage
- Instagram Reels showcase

### Delivery
- Dedicated "Delivery Info" page linked from header

---

## 6. Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | Static HTML + vanilla JS (no build step) |
| Product data | JSON file (easy to add new toys) |
| Hosting | Netlify or Vercel (free tier) |
| Animations | CSS keyframes |

---

## Next Step

Website is built and ready for deploy. See `project.md` for the final result summary.

---

- [[00_INDEX]]
- [[02_PROJECTS/elonas-toys-website/_INDEX]]
- [[02_PROJECTS/elonas-toys-website/DISCOVERY_NOTES]]

---
