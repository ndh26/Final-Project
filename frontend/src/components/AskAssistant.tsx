import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { askAssistant, type AssistantContact } from '../api/assistant'

interface Turn {
  role: 'user' | 'assistant'
  content: string
  contact?: AssistantContact
}

const STARTERS = ['What jelly flavors do you have?', 'When is the next market day?', 'Do you offer gift boxes?']

/** The AI assistant box: answers from the site's own info and hands anything else to Lisha. */
export default function AskAssistant() {
  const [turns, setTurns] = useState<Turn[]>([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const logRef = useRef<HTMLOListElement>(null)

  // Keep the newest message in view.
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' })
  }, [turns, busy])

  async function ask(question: string) {
    const q = question.trim()
    if (!q || busy) return
    setError(null)
    setBusy(true)
    setDraft('')
    const history = turns.slice(-6).map(({ role, content }) => ({ role, content }))
    setTurns((t) => [...t, { role: 'user', content: q }])
    try {
      const answer = await askAssistant(q, history)
      setTurns((t) => [...t, { role: 'assistant', content: answer.reply, contact: answer.contact }])
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    void ask(draft)
  }

  return (
    <section className="assistant" aria-label="Ask our assistant">
      <h2>Ask about our jellies</h2>
      <p className="muted">
        Our AI assistant answers from this website’s information. For anything else, it’ll help you send
        your question to Lisha.
      </p>

      {turns.length === 0 && (
        <div className="assistant-starters">
          {STARTERS.map((s) => (
            <button key={s} type="button" onClick={() => void ask(s)} disabled={busy}>
              {s}
            </button>
          ))}
        </div>
      )}

      {turns.length > 0 && (
        <ol className="assistant-log" aria-live="polite" ref={logRef}>
          {turns.map((t, i) => (
            <li key={i} className={`assistant-turn from-${t.role}`}>
              <p>{t.content}</p>
              {t.contact && (
                <Link
                  className="btn btn-ghost assistant-handoff"
                  to={`/contact?topic=${encodeURIComponent(t.contact.topic)}&message=${encodeURIComponent(t.contact.message)}`}
                >
                  Send this question to Lisha →
                </Link>
              )}
            </li>
          ))}
          {busy && <li className="assistant-turn from-assistant thinking">Thinking…</li>}
        </ol>
      )}

      <form className="assistant-form" onSubmit={onSubmit}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={400}
          placeholder="Ask a question…"
          aria-label="Your question"
        />
        <button type="submit" className="btn btn-primary" disabled={busy || !draft.trim()}>
          Ask
        </button>
      </form>
      {error && <p className="form-status">{error}</p>}
      <p className="assistant-fine">AI answers can be imperfect; Lisha always has the final word.</p>
    </section>
  )
}
