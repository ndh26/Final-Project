import type { ContactRequest } from '../types'

// --- Contact Me --------------------------------------------------------------
//
// Inquiries are emailed by Web3Forms (https://web3forms.com) straight from the
// browser to the inbox set in the Web3Forms dashboard for this key. The key is a
// public form ID by design (it ships in every visitor's browser), so it lives here
// rather than in .env; VITE_WEB3FORMS_ACCESS_KEY can still override it.

const WEB3FORMS_URL = 'https://api.web3forms.com/submit'
const WEB3FORMS_KEY =
  import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '70f06944-3386-4466-9578-295e3d6463cd'

const THANKS = "Thanks for reaching out! We'll get back to you soon."
const SEND_FAILED = 'Sorry, your message couldn’t be sent right now. Please try again in a little while.'

async function deliver(request: ContactRequest): Promise<void> {
  const res = await fetch(WEB3FORMS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      subject: `Website inquiry: ${request.topic} from ${request.name}`,
      from_name: 'Rare Tastes of Texas website',
      // Web3Forms sets the visitor's email as Reply-To, so hitting Reply answers them.
      name: request.name,
      email: request.email,
      phone: request.phone || 'not given',
      topic: request.topic,
      message: request.message,
    }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok || !body?.success) {
    console.error('[contact] Web3Forms rejected the message', res.status, body)
    throw new Error(SEND_FAILED)
  }
}

/** Sends a Contact Me inquiry. Resolves with the thank-you message or throws a readable error. */
export async function sendContact(request: ContactRequest): Promise<string> {
  // Honeypot filled in: a bot. Pretend it worked so it doesn't retry.
  if (request.website) return THANKS

  await deliver(request)
  return THANKS
}
