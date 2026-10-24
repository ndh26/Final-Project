/**
 * Spending guard for the assistant.
 *
 * - Per visitor: at most PER_IP_PER_HOUR questions an hour (stops one person or bot hammering it).
 * - Whole site: at most DAILY_QUESTIONS questions and DAILY_TOKENS tokens per day (Texas time).
 *   Once either is reached the assistant switches off until midnight, so a bug or attack can
 *   never run up more than a few cents a day.
 *
 * Counters live in Netlify Blobs when deployed. Locally (no Netlify environment) they fall back
 * to memory. Visitor IPs are stored only as salted hashes.
 */

import { createHash } from 'node:crypto'
import { getStore } from '@netlify/blobs'

export const BUDGET = {
  PER_IP_PER_HOUR: 20,
  DAILY_QUESTIONS: 400,
  DAILY_TOKENS: 400_000,
}

interface Counter {
  get(key: string): Promise<number>
  set(key: string, value: number): Promise<void>
}

const memory = new Map<string, number>()
const memoryCounter: Counter = {
  get: async (key) => memory.get(key) ?? 0,
  set: async (key, value) => void memory.set(key, value),
}

function counter(): Counter {
  try {
    const store = getStore('assistant-budget')
    return {
      get: async (key) => Number((await store.get(key, { type: 'json' })) ?? 0),
      set: async (key, value) => void (await store.setJSON(key, value)),
    }
  } catch {
    return memoryCounter // not running on Netlify (local dev and tests)
  }
}

function texasDay(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago' }).format(now)
}

function ipKey(ip: string, now = new Date()): string {
  const hour = now.toISOString().slice(0, 13)
  const hash = createHash('sha256').update(`${ip}|${texasDay(now)}`).digest('hex').slice(0, 16)
  return `ip-${hash}-${hour}`
}

export type BudgetCheck = { ok: true } | { ok: false; reason: 'rate' | 'daily' }

/** Check limits and count this question. Call before running the agent. */
export async function admit(ip: string, now = new Date()): Promise<BudgetCheck> {
  const c = counter()
  const day = texasDay(now)
  const [perIp, questions, tokens] = await Promise.all([
    c.get(ipKey(ip, now)),
    c.get(`day-${day}-questions`),
    c.get(`day-${day}-tokens`),
  ])
  if (questions >= BUDGET.DAILY_QUESTIONS || tokens >= BUDGET.DAILY_TOKENS) return { ok: false, reason: 'daily' }
  if (perIp >= BUDGET.PER_IP_PER_HOUR) return { ok: false, reason: 'rate' }
  await Promise.all([c.set(ipKey(ip, now), perIp + 1), c.set(`day-${day}-questions`, questions + 1)])
  return { ok: true }
}

/** Add the tokens a question actually used to today's total. */
export async function recordTokens(tokens: number, now = new Date()): Promise<void> {
  const c = counter()
  const key = `day-${texasDay(now)}-tokens`
  await c.set(key, (await c.get(key)) + tokens)
}

/** Test helper: clear in-memory counters. */
export function resetMemoryBudget(): void {
  memory.clear()
}
