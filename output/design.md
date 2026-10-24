# Rare Tastes of Texas — Design

An informational website for a small prickly pear business, built with React + Vite +
TypeScript as a static site, plus one Netlify Function for the AI assistant.

## Architecture

```
Browser ──▶ static host (Netlify) ── index.html, JS, CSS, images
   │
   ├─ React app (5 pages, client-side routing)
   ├─ Contact Me form ──▶ Web3Forms ──▶ Lisha's inbox
   └─ Ask-about-our-jellies box ──▶ Netlify Function ──▶ Portkey ──▶ gpt-5.6-luna
                                       └─ Netlify Blobs (budget counters, answer cache)
```

- **Pages** (`frontend/src/pages/`): `Home`, `About`, `Products`, `Market`, `Contact`, with a
  shared `NavBar` and `Footer` and small components (`ProductImage`, `Flourish`, `PricklyPear`
  logo/placeholder).
- **Content**: the product list is `src/data/products.json`, bundled at build time through
  `src/products.ts`. Images are in `public/images/`.
- **Logic** (`src/api/site.ts`): Web3Forms delivery for Contact Me, and the Goliad Market Days
  date calculation.
- **Hosting**: `public/_redirects` sends every path to `index.html`, so links such as `/products`
  load directly and survive a refresh on Netlify.

## Key decisions

- **A small, honest assistant instead of a chatbot that guesses.** It answers only from the site's
  facts, says "I don't know" otherwise, and turns every unanswerable question into a pre-filled
  message to Lisha. Visitors get instant answers to the common questions; Lisha gets the rest as
  normal emails.
- **Server-side function for the model key.** The key never reaches the browser. That requires a
  Git-based Netlify deploy instead of drag-and-drop.
- **Measured, not assumed, cost choices.** `netlify/eval.mjs` compared facts-from-tools against
  facts-in-the-prompt on the same questions; both scored 8/8, the prompt version was cheaper and
  about twice as fast, so it is the default.

- **Static site plus one function instead of a backend.** The site began with the HW 4 layout
  (FastAPI + JSON data). Once Web3Forms handled email, an always-on server wasn't worth paying
  for, so the products were bundled into the site and only the assistant runs server-side, as a
  free-tier Netlify Function. The old backend is kept in `archive/`.
- **Every page always listed in the header.** There's no collapsed hamburger menu; on narrow
  screens the links wrap onto a row under the brand. Home is just the business card and a short
  intro strip, and each topic (About, Products, Market, Contact) has its own page.
- **No shopping cart.** Availability depends on the harvest, so the jelly has an "Ask about
  availability" button that opens Contact Me pre-filled. The cinnamon rolls are `marketOnly`
  and link to the market page instead.
- **One recurring market, its own page.** Lisha sells at Goliad Market Days on the 2nd Saturday of
  every month. `nextMarketDay()` computes the next 2nd Saturday in the browser ("today" on market
  day), so the date never goes stale. Market hours aren't shown because only unofficial listings
  give them.
- **Theme from Lisha's own artwork.** The site uses her business card's look (blush-pink paper,
  wine Great Vibes script, gold flourishes, prickly pear red and green), and the card itself,
  with the phone number removed, is the Home hero. The About page switches to the brown,
  parchment and gold of her Hall Ranch letter. Fonts (Great Vibes, Playfair Display, Lora) are
  self-hosted through `@fontsource`, so there are no third-party font requests.
- **Artwork edited to match the copy.** The card's tagline was re-lettered in Great Vibes to add
  mesquite bean, and the About letter's body was re-set in Baskerville (persimmons and the
  gift-card line removed, a typo fixed) after inpainting the old text out with OpenCV.
- **About artwork plus text.** On wide screens the letter artwork is the page. On phones its text
  would be too small, so the same words render as a styled parchment card, and screen readers
  always get the text.
- **Product photos on transparent backgrounds.** Backgrounds were removed (rembg, then hand
  cleanup), so the jars and rolls sit directly on the pink theme.
- **Nothing invented.** Product copy comes from Lisha's letter and jar labels, `price: null`
  hides pricing, and a missing photo falls back to an illustration.
- **Email via Web3Forms, not our own mail server.** Sending email ourselves would need a separate
  email account and password and a server. Web3Forms only needs a free access key registered to
  Lisha's email address, and the browser sends the message directly.

## Data flow: a Contact Me submission

1. The visitor fills in name, email, optional phone, topic, and message. A hidden honeypot field
   catches bots, which are quietly ignored.
2. The browser sends the inquiry to Web3Forms, which emails it to Lisha's inbox with the
   visitor's address as Reply-To.
3. The visitor sees a thank-you message, or a "please try again" error if delivery failed.
