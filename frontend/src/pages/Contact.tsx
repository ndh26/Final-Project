import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { sendContact } from '../api/site'
import { PRODUCTS } from '../products'
import { CONTACT_TOPICS, type ContactRequest, type ContactTopic } from '../types'

const EMPTY: ContactRequest = { name: '', email: '', phone: '', topic: 'Other', message: '', website: '' }

/**
 * Links can pre-fill the form: a product's "Ask about availability" button sends
 * ?topic=availability&product=<id>, and the assistant's hand-off sends ?topic=<topic>&message=<text>.
 */
function prefill(params: URLSearchParams): ContactRequest {
  const topicParam = params.get('topic') ?? ''
  const topic: ContactTopic =
    topicParam === 'availability'
      ? 'Product availability'
      : CONTACT_TOPICS.includes(topicParam as ContactTopic)
        ? (topicParam as ContactTopic)
        : 'Other'
  const productName = PRODUCTS.find((p) => p.productId === params.get('product'))?.name
  const message =
    params.get('message')?.slice(0, 1000) ??
    (productName ? `Hi! Which ${productName} flavors are available right now?` : '')
  return { ...EMPTY, topic, message }
}

export default function Contact() {
  const [params] = useSearchParams()
  const [form, setForm] = useState<ContactRequest>(() => prefill(params))

  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  function update(field: keyof ContactRequest) {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus(null)
    setBusy(true)
    try {
      const thanks = await sendContact(form)
      setStatus({ ok: true, text: thanks })
      setForm(EMPTY)
    } catch (err) {
      setStatus({ ok: false, text: (err as Error).message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="section contact">
      <div className="contact-intro">
        <p className="eyebrow">Contact Me</p>
        <h1>Let’s talk prickly pears</h1>
        <p>
          Ask what’s available this season, where we’ll be next, or anything else. Your message comes straight
          to me and I’ll reply by email.
        </p>
        <ul className="contact-perks">
          <li>
            <strong>Deliveries:</strong> ask about having your order delivered.
          </li>
          <li>
            <strong>Gift packaging is available:</strong> jars can be boxed and wrapped as a gift.
          </li>
        </ul>
        <figure className="packaging">
          <img
            src="/images/gift-packaging.webp"
            alt="Four jars with fabric-topped lids in a black gift box with a polka-dot ribbon"
            width={1200}
            height={900}
            loading="lazy"
          />
          <figcaption>Gift packaging</figcaption>
        </figure>
      </div>

      {status?.ok ? (
        <div className="contact-card contact-sent" role="status">
          <h2>Message sent</h2>
          <p>{status.text}</p>
          <button className="btn btn-ghost" onClick={() => setStatus(null)}>
            Send another message
          </button>
        </div>
      ) : (
        <form className="contact-card" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Name
              <input value={form.name} onChange={update('name')} required maxLength={100} autoComplete="name" />
            </label>
            <label>
              Email
              <input type="email" value={form.email} onChange={update('email')} required autoComplete="email" />
            </label>
          </div>
          <div className="form-row">
            <label>
              <span>
                Phone <span className="optional">(optional)</span>
              </span>
              <input type="tel" value={form.phone} onChange={update('phone')} maxLength={30} autoComplete="tel" />
            </label>
            <label>
              Topic
              <select value={form.topic} onChange={update('topic')}>
                {CONTACT_TOPICS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Message
            <textarea value={form.message} onChange={update('message')} required maxLength={4000} rows={6} />
          </label>
          {/* Honeypot: hidden from people and screen readers; bots that fill it are ignored. */}
          <input
            className="hp"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={form.website}
            onChange={update('website')}
          />
          {status && !status.ok && <p className="form-status">{status.text}</p>}
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Sending…' : 'Send message'}
          </button>
        </form>
      )}
    </section>
  )
}
