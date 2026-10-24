import type { ContactTopic } from '../types'

// The assistant runs as a Netlify Function (netlify/functions/assistant.mts) so the model's API
// key never reaches the browser. In local dev, vite.config.ts routes this path to the same code.
const ENDPOINT = '/.netlify/functions/assistant'

export interface AssistantContact {
  topic: ContactTopic
  message: string
}

export interface AssistantAnswer {
  reply: string
  contact?: AssistantContact
}

export async function askAssistant(
  message: string,
  history: { role: 'user' | 'assistant'; content: string }[],
): Promise<AssistantAnswer> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok || !body?.reply) {
    throw new Error(body?.error ?? 'The assistant isn’t available right now. Please use the Contact Me page.')
  }
  return { reply: body.reply, contact: body.contact }
}
