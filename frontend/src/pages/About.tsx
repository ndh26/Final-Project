import { Link } from 'react-router-dom'

// Lisha's "Heritage of the Hall Ranch" letter. The artwork is the page on wide screens; on
// phones (where the image's text would be too small to read) the same words are shown as text.
// Screen readers always get the text version.
const TITLE = 'The Heritage of the Hall Ranch, Captured in Every Jar'
const WELCOME = 'Welcome to a taste of authentic Texas:'
const STORY = [
  'Nestled among the untouched native brushlands of our private ranch, every jar in this collection reflects a tradition of stewardship, craftsmanship, and respect for the land. Here, the soil has remained virgin and unspoiled, the water pure, and the native landscape preserved as nature intended. Our ranch is home to abundant wildlife and carefully tended crops and fruit-bearing native plants, thriving together in a healthy, balanced environment.',
  'The flavors you are about to enjoy come from remarkable Texas natives—ruby-red prickly pears, mesquite beans, and other seasonal treasures found across our ranch. Each fruit is individually hand-picked at the perfect moment of ripeness, never mechanically harvested, ensuring that only the finest fruit becomes part of our small-batch creations.',
  'Every jar is handcrafted with patience and care, honoring traditional methods that preserve the natural character, vibrant color, and distinctive flavors of each harvest. From the first blossom to the final seal, every step is guided by a commitment to quality rather than quantity.',
  'This collection represents more than handcrafted preserves—it is the story of a ranch that values conservation, purity, and the enduring beauty of the Texas landscape. We are proud to share a small piece of that heritage with you.',
  'May each jar remind you that the finest things are still created by hand, nurtured by nature, and shared with gratitude.',
]

export default function About() {
  return (
    <div className="about-page">
      <section className="about-frame">
        <img
          className="about-art"
          src="/images/about-heritage.webp"
          alt=""
          aria-hidden="true"
          width={1024}
          height={1024}
        />
        <article className="about-letter">
          <h1>{TITLE}</h1>
          <p className="about-welcome">{WELCOME}</p>
          {STORY.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
          <p className="about-closing">
            From our Texas ranch to your <span className="nowrap">table—</span>
            <br />
            welcome, and enjoy.
          </p>
          <p className="about-signature">Lisha Hall</p>
        </article>
      </section>

      <section className="section center about-cta">
        <h2>Want to say hello?</h2>
        <p>Questions about our jellies, cinnamon rolls, or gift boxes are always welcome.</p>
        <Link to="/contact" className="btn btn-gold">
          Contact Me
        </Link>
      </section>
    </div>
  )
}
