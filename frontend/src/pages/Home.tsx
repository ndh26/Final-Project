import { Link } from 'react-router-dom'

const STEPS = [
  {
    title: 'Hand-picked',
    copy: 'Every prickly pear and mesquite bean is picked by hand at the perfect moment of ripeness.',
  },
  {
    title: 'Small batches',
    copy: 'Each jar is handcrafted with patience and care, so there’s only as much as the harvest allows.',
  },
  {
    title: 'Brought to market',
    copy: 'Find us at Goliad Market Days on the 2nd Saturday of every month.',
  },
]

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <h1 className="sr-only">
          Rare Tastes of Texas: homemade prickly pear and mesquite bean jelly by Lisha Hall
        </h1>
        <img
          className="hero-card"
          src="/images/home-card.webp"
          alt="Homemade prickly pear and mesquite bean jelly by Lisha Hall"
          width={1473}
          height={954}
        />
        <div className="hero-actions">
          <Link to="/products" className="btn btn-primary">
            See our products
          </Link>
          <Link to="/market" className="btn btn-ghost">
            Find us at the market
          </Link>
        </div>
      </section>

      <section className="section band">
        <div className="band-grid">
          {STEPS.map((s) => (
            <div key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.copy}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
