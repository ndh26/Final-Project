import { Link } from 'react-router-dom'
import AskAssistant from '../components/AskAssistant'
import Flourish from '../components/Flourish'
import ProductImage from '../components/ProductImage'
import { PRODUCTS } from '../products'

export default function Products() {
  return (
    <section className="section">
      <div className="section-title">
        <h1>Products</h1>
        <Flourish />
      </div>
      <p className="lead center-text">
        Everything is made from the Texas harvest, so what’s available changes with the season. There’s no
        online checkout. To check availability, arrange a delivery, or order a gift box,{' '}
        <Link to="/contact">contact me</Link>.
      </p>

      <div className="product-list">
        {PRODUCTS.map((p) => (
          <article key={p.productId} className="product-row">
            <ProductImage product={p} />
            <div className="product-info">
              <h2>{p.name}</h2>
              {p.price && <p className="product-price">{p.price}</p>}
              <p>{p.description}</p>
              {p.flavors.length > 0 && (
                <div className="flavors">
                  <h3>Flavors</h3>
                  <ul>
                    {p.flavors.map((f) => (
                      <li key={f.name}>
                        {f.name}
                        {f.note && <span> · {f.note}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {p.availability && <p className="product-availability">{p.availability}</p>}
              {p.marketOnly ? (
                <Link to="/market" className="text-link">
                  Market details →
                </Link>
              ) : (
                <Link to={`/contact?topic=availability&product=${p.productId}`} className="btn btn-primary">
                  Ask about availability
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>

      <AskAssistant />
    </section>
  )
}
