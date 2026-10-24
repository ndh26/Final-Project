// Shapes of the site content (src/data/products.json) and the Contact Me form.

export interface Flavor {
  name: string
  /** Short aside such as "with a kick"; empty when there's nothing to add. */
  note: string
}

export interface Product {
  productId: string
  name: string
  tagline: string
  description: string
  /** Image path under /images/products/, or null to show the placeholder illustration. */
  image: string | null
  /** Display text such as "$8 / jar"; null when pricing isn't listed. */
  price: string | null
  availability: string
  flavors: Flavor[]
  /** Sold only at Goliad Market Days, so there's no "Ask about availability" button. */
  marketOnly: boolean
}

export const CONTACT_TOPICS = [
  'Product availability',
  'Deliveries',
  'Gift packaging',
  'Goliad Market Days',
  'Other',
] as const
export type ContactTopic = (typeof CONTACT_TOPICS)[number]

export interface ContactRequest {
  name: string
  email: string
  phone: string
  topic: ContactTopic
  message: string
  /** Honeypot: left empty by people, filled in by bots. */
  website: string
}
