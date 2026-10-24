# Rare Tastes of Texas

**Live site: https://raretastesoftexas.com**  
**Repository: https://github.com/ndh26/Final-Project**

A website for Lisha Hall's small Texas business, homemade jelly (prickly pear, spicy prickly pear,
mesquite bean) and cinnamon rolls (prickly pear, mesquite bean) sold at Goliad Market Days, with an
**AI assistant** ("Ask about our jellies") that answers customer questions from the site's own
facts and hands anything it can't answer to Lisha as a pre-filled Contact message.

Built with **React + Vite + TypeScript**, plus one **Netlify Function** for the assistant, which
calls **gpt-5.6-luna** through the course **Portkey** key. Report: `report/report.html`. Slides:
`report/slides.html`.

## Run it locally (about 5 minutes)

**You need:** [Node.js](https://nodejs.org) **22.12 or newer** (check with `node --version`), git,
and the course `PORTKEY_API_KEY`. Nothing else: no database, no Python, no other keys.

1. **Clone the repo.**

   ```bash
   git clone https://github.com/ndh26/Final-Project.git
   ```

2. **Provide the key.** The app looks for a `.env` file in **two places, in this order**:
   1. the repo's own folder (next to this README)
   2. the folder **above** the repo (for example a shared `submissions/.env`)

   If neither exists yet, copy `.env.example` to `.env` in the repo folder and fill in
   `PORTKEY_API_KEY=...`. That is the only key the app uses.

3. **Install and start** (from the repo folder):

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   The terminal prints `assistant: PORTKEY_API_KEY loaded from <path>` and
   `Local: http://localhost:5173/`.

4. **Open http://localhost:5173** and try it:
   - **Products** or **Goliad Market Days** page → scroll to **"Ask about our jellies"** → click
     a starter question, or ask something like *"Can you ship a gift box to Dallas?"*. Questions it
     can't answer show a **"Send this question to Lisha"** button that opens the pre-filled
     Contact form.
   - The pages: **Home, About, Products, Goliad Market Days, Contact Me**.

**Notes**
- Without a key, the site still runs; only the chat box shows an "isn't set up" message.
- The Contact form really sends: submitting it emails the business through Web3Forms.
- Optional: `node netlify/eval.mjs` (from `frontend/`) re-runs the token measurements and safety
  tests and writes `output/eval_results.json`. It makes about 50 small model calls.

## What's in the site

| Page | Route | Content comes from |
|---|---|---|
| Home | `/` | Lisha's business card + "hand-picked / small batches / brought to market" strip |
| About | `/about` | Hall Ranch letter artwork + its text in `src/pages/About.tsx` |
| Products | `/products` | `src/data/products.json` + `public/images/products/` |
| Goliad Market Days | `/market` | 2nd Saturday every month; next date computed automatically |
| Contact Me | `/contact` | form → Web3Forms → email to the business |
| Assistant | Products + Market pages | `netlify/functions/assistant.mts` → Portkey → `gpt-5.6-luna` |

## Layout

```
Final Project/
├── README.md
├── .env.example           # the one key the app needs (PORTKEY_API_KEY); copy to .env
├── netlify.toml           # Netlify build settings
├── frontend/              # the website (Vite React TypeScript app)
│   ├── public/
│   │   ├── _redirects     #   Netlify: lets /products etc. load directly
│   │   └── images/        #   home card, About letter, gift packaging, products/
│   ├── src/
│   │   ├── data/products.json   # product list (the Products page and the assistant both read it)
│   │   ├── pages/         #   Home, About, Products, Market, Contact
│   │   └── components/    #   NavBar, Footer, AskAssistant, ProductImage, Flourish, PricklyPear
│   └── netlify/
│       ├── functions/assistant.mts   # the AI assistant endpoint (Netlify Function)
│       ├── lib/           #   agent.ts (prompt, tools, guards), budget.ts, cache.ts, localEnv.ts
│       └── eval.mjs       #   token/cost measurements + safety tests
├── output/                # harness.md, design.md, eval_results.json
├── report/                # final report and slide deck (HTML + PDF)
└── archive/               # the earlier FastAPI backend, no longer used (see below)
```

## How the assistant stays safe and cheap

- Answers only from the site's facts; says "I don't know" and hands off for prices, hours,
  ingredients, allergens, and custom orders.
- Its only action drafts a Contact message the visitor reviews and sends. It holds no secrets and
  can't take payments or change anything.
- Code guards after every answer: prompt-leak canary, invented-price check, loop and length caps.
- Limits: 400-character questions, 4 model calls per question, 20 questions per visitor per hour,
  and 400 questions or 400,000 tokens per day site-wide.
- Measured cost: about **$0.0003 per question**. Details in `output/harness.md` and the report.

## Publish it (Netlify)

The assistant runs server-side, so Netlify deploys from GitHub (drag-and-drop only uploads plain
files).

1. Push this repo to GitHub.
2. In Netlify: your site → **Site configuration → Build & deploy → Link repository** (or **Add
   new site → Import an existing project**). `netlify.toml` already says to build `frontend/`.
3. **Site configuration → Environment variables:** add `PORTKEY_API_KEY` (secret, never commit it).
4. Netlify redeploys on every push. The custom domain `raretastesoftexas.com` is attached under
   **Domain management**, and Netlify issues the https certificate automatically.

The Contact form's Web3Forms key is a public form ID by design, so it lives in
`src/api/site.ts`; the recipient inbox is set in the Web3Forms dashboard.

## Updating content

**Products and flavors:** edit `frontend/src/data/products.json`, then commit and push. The
assistant reads the same file, so it learns about changes automatically. Each product has a
`"flavors"` list (`{"name": "Spicy Prickly Pear", "note": "with a kick"}`). Setting `"price"` to
text such as `"$8 / jar"` shows a price; `null` hides it. Set `"marketOnly": true` for items sold
only at Goliad Market Days (currently the cinnamon rolls).

**Product photos:** put the photo in `frontend/public/images/products/` and set that product's
`"image"` to `/images/products/<file name>`. Transparent-background `.webp` or `.png` photos look
best on the pink theme.

**Market:** Goliad Market Days, 2nd Saturday of every month. To change it, edit
`frontend/src/market.ts` (shared by the Market page and the assistant).

**About page:** the artwork is `frontend/public/images/about-heritage.webp`. Its words are also
in `frontend/src/pages/About.tsx`, which phones and screen readers use, so update both together.

**Look and feel:** colors and fonts are CSS variables at the top of `frontend/src/index.css`.

## The archived backend

Earlier versions used a FastAPI backend (the HW 4 structure) to serve the product list and keep a
backup log of contact messages. Once Web3Forms took over email, that server's only remaining job
was serving one small JSON file, so the product list moved into the site and the backend was
retired. Its code is kept in `archive/` for reference.
