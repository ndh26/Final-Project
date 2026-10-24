/**
 * Answer cache for opening questions.
 *
 * Most visitors start with the same few questions (the starter buttons send identical text), so a
 * first-turn question that was answered today is served from storage with zero model tokens.
 * Keys include today's Texas date, so date-dependent answers ("next market day") never go stale.
 * Follow-up questions (with conversation history) are never cached.
 */

import { getStore } from '@netlify/blobs'
import type { ContactSuggestion } from './agent.ts'

export interface CachedAnswer {
  reply: string
  contact?: ContactSuggestion
}

const memory = new Map<string, CachedAnswer>()

function store() {
  try {
    const s = getStore('assistant-answers')
    return {
      get: async (key: string) => ((await s.get(key, { type: 'json' })) as CachedAnswer | null) ?? undefined,
      set: async (key: string, value: CachedAnswer) => void (await s.setJSON(key, value)),
    }
  } catch {
    return {
      get: async (key: string) => memory.get(key),
      set: async (key: string, value: CachedAnswer) => void memory.set(key, value),
    }
  }
}

function cacheKey(question: string, now = new Date()): string {
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago' }).format(now)
  const normalized = question.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()
  return `${day}:${normalized}`.slice(0, 300)
}

export async function getCachedAnswer(question: string): Promise<CachedAnswer | undefined> {
  return store().get(cacheKey(question))
}

export async function cacheAnswer(question: string, answer: CachedAnswer): Promise<void> {
  await store().set(cacheKey(question), answer)
}
