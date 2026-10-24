# Rare Tastes of Texas — Harness

How the site is put together and hosted, where its content lives, how the AI assistant works,
and the guardrails around the assistant and the Contact Me form.

## What gets deployed

`npm run build` (in `frontend/`) writes the whole site to `frontend/dist/`:

| Path | Purpose |
|---|---|
| `index.html` + `assets/` | The React app, styles, and self-hosted fonts |
| `images/` | Home card, About letter, gift packaging photo, `products/` photos |
| `_redirects` | Netlify rule `/* /index.html 200`, so `/products`, `/market`, etc. load directly |

Netlify also deploys one serverless function, `netlify/functions/assistant.mts` (see below). The
browser makes two kinds of outside requests: Contact Me submissions to Web3Forms, and assistant
questions to that function.

## Content

| File | Shape |
|---|---|
| `frontend/src/data/products.json` | `productId`, `name`, `tagline`, `description`, `image` (path under `/images/products/` or null), `price` (text or null), `availability`, `flavors` (list of `name` + optional `note`), `marketOnly` (true hides "Ask about availability") |

The product list is bundled at build time and typed against `Product` in `src/types.ts`, so a
missing or misspelled field fails the build (`tsc`) instead of breaking the live page.

## Contact Me flow

1. The visitor submits the form. The browser checks required fields, lengths, and email format.
2. `frontend/src/api/site.ts` POSTs the inquiry to Web3Forms (`https://api.web3forms.com/submit`)
   with the site's public form key. Web3Forms emails it to the inbox set for that key in the
   Web3Forms dashboard (to be Lisha's address).
3. The visitor sees "Message sent", or a "please try again" error if Web3Forms rejected it.

## Contact Me guardrails

- **Fixed recipient.** Web3Forms delivers only to the inbox configured for the key in its
  dashboard. Nothing in the form can change where mail goes, and the inbox address never appears
  in the site's code.
- **No spoofing.** Mail is sent by Web3Forms. The visitor's address only appears as Reply-To.
- **Validation.** Name up to 100 characters, a valid email, phone up to 30, message up to 4000, and
  a topic from a fixed list (product availability, deliveries, gift packaging, Goliad Market Days,
  other).
- **Spam control.** A hidden honeypot field makes the browser skip sending when a bot fills it in,
  and Web3Forms applies its own spam filtering.
- **Honest errors.** If Web3Forms rejects a message, the visitor is told to try again rather than
  shown a false "sent".
- **Privacy.** No visitor data is stored by the site. Web3Forms keeps submissions for 30 days on
  the free plan.

## Configuration

| Variable | Where | Required | Purpose |
|---|---|---|---|
| `PORTKEY_API_KEY` | `.env` in the repo folder or the folder above it (local); Netlify environment variables (live) | for the assistant | Course Portkey key for `gpt-5.6-luna`. Secret, never committed |
| `VITE_WEB3FORMS_ACCESS_KEY` | build environment | no | Overrides the public Web3Forms form key built into `src/api/site.ts` |

`.env.example` at the repo root lists the one required key. Locally, `netlify/lib/localEnv.ts`
looks for `.env` in the repo's own folder first, then the folder above it; a variable already set
in the shell wins. Without the key the site runs normally and the chat box reports that the
assistant isn't set up.

## AI assistant

| Piece | File | Role |
|---|---|---|
| Endpoint | `netlify/functions/assistant.mts` | `POST /.netlify/functions/assistant {message, history}`: validates input, applies the budget, serves the answer cache, runs the agent, logs usage |
| Agent | `netlify/lib/agent.ts` | System prompt, tools, model loop (Portkey → `gpt-5.6-luna`, OpenAI Responses API), output guards |
| Budget | `netlify/lib/budget.ts` | Per-visitor and site-wide daily limits (Netlify Blobs) |
| Cache | `netlify/lib/cache.ts` | Same-day answers to repeated opening questions (Netlify Blobs) |
| UI | `src/components/AskAssistant.tsx` | Chat box on the Products and Market pages; "Send this question to Lisha" hand-off |
| Tests | `netlify/eval.mjs` → `output/eval_results.json` | Token measurements, attack tests, guard and limit checks |

**Tools.** `suggest_contact(topic, message)` is the agent's only action: it returns a pre-filled
Contact Me link that the visitor reviews and sends. In the `tools` variant the agent also has three
read-only lookups (`get_products`, `get_market_info`, `get_ordering_info`); in the default
`inline` variant the same facts are placed in the prompt instead (equal accuracy, cheaper, faster).

**Limits.**

| Guard | Value |
|---|---|
| Question length | 400 characters |
| Conversation history | 6 turns, 600 characters each, roles user/assistant only |
| Model calls per question | 4 |
| Output tokens per call | 350 |
| Reply length | 900 characters |
| Model timeout | 20 seconds |
| Per visitor | 20 questions/hour (IP stored only as a salted hash) |
| Whole site | 400 questions or 400,000 tokens per day (Texas time), then the assistant pauses |

**Output guards** (code, after the model answers): canary-string check for prompt leaks,
dollar-amount check (no prices are published, so any price is invented), loop fallback, length
cap, markup stripped from hand-off messages, and a polite refusal when the provider's content
filter blocks a request.

**Configuration.** `PORTKEY_API_KEY` (secret, Netlify environment variable). Optional:
`ASSISTANT_MODEL` (default `gpt-5.6-luna`), `ASSISTANT_VARIANT` (`inline` or `tools`).
