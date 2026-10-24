/**
 * POST /.netlify/functions/assistant  { message, history }  ->  { reply, contact?, usage, cached }
 *
 * Validates input, applies the spending guard, serves repeated opening questions from the answer
 * cache, otherwise runs the agent, and logs one line per question (tokens, tools, guards) to the
 * Netlify function log for cost tracking.
 */

import { admit, recordTokens } from '../lib/budget.ts'
import { runAgent, type ChatTurn } from '../lib/agent.ts'
import { cacheAnswer, getCachedAnswer } from '../lib/cache.ts'

const MAX_MESSAGE = 400
const MAX_HISTORY = 6
const MAX_TURN = 600

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

function parseHistory(raw: unknown): ChatTurn[] | null {
  if (raw === undefined) return []
  if (!Array.isArray(raw) || raw.length > MAX_HISTORY) return null
  const turns: ChatTurn[] = []
  for (const t of raw) {
    if (!t || (t.role !== 'user' && t.role !== 'assistant') || typeof t.content !== 'string') return null
    turns.push({ role: t.role, content: t.content.slice(0, MAX_TURN) })
  }
  return turns
}

export default async (req: Request, context?: { ip?: string }) => {
  if (req.method !== 'POST') return json(405, { error: 'Use POST.' })

  const apiKey = process.env.PORTKEY_API_KEY
  if (!apiKey) return json(503, { error: 'The assistant isn’t set up yet. Please use the Contact Me page.' })

  const body = await req.json().catch(() => null)
  const message = typeof body?.message === 'string' ? body.message.trim() : ''
  const history = parseHistory(body?.history)
  if (!message) return json(400, { error: 'Please type a question.' })
  if (history === null) return json(400, { error: 'Sorry, something went wrong with the conversation. Please refresh the page.' })
  if (message.length > MAX_MESSAGE) {
    return json(400, { error: `Please keep questions under ${MAX_MESSAGE} characters.` })
  }

  const ip = context?.ip || req.headers.get('x-nf-client-connection-ip') || 'unknown'
  const check = await admit(ip)
  if (!check.ok) {
    return json(429, {
      error:
        check.reason === 'rate'
          ? 'You’ve asked a lot of questions this hour. Please try again later, or use the Contact Me page.'
          : 'The assistant is resting for today. Please use the Contact Me page and Lisha will reply by email.',
    })
  }

  const firstTurn = history.length === 0
  if (firstTurn) {
    const hit = await getCachedAnswer(message)
    if (hit) {
      console.log(JSON.stringify({ event: 'assistant', cached_answer: true, input: 0, output: 0 }))
      return json(200, { ...hit, usage: { input: 0, cached: 0, output: 0, calls: 0, gatewayCacheHits: 0 }, cached: true })
    }
  }

  try {
    const result = await runAgent(apiKey, message, history)
    if (firstTurn && !result.guard) await cacheAnswer(message, { reply: result.reply, contact: result.contact })
    await recordTokens(result.usage.input + result.usage.output)
    console.log(
      JSON.stringify({
        event: 'assistant',
        calls: result.usage.calls,
        gateway_cache_hits: result.usage.gatewayCacheHits,
        input: result.usage.input,
        cached: result.usage.cached,
        output: result.usage.output,
        tools: result.toolsUsed,
        guard: result.guard ?? null,
      }),
    )
    return json(200, { reply: result.reply, contact: result.contact, usage: result.usage, guard: result.guard, cached: false })
  } catch (err) {
    console.error('[assistant] failed:', err)
    return json(502, { error: 'Sorry, I’m having trouble right now. Please try again, or use the Contact Me page.' })
  }
}
