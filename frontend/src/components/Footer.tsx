import { Link } from 'react-router-dom'
import Brand from './Brand'
import { PAGES } from '../siteLinks'

const YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="brand">
            <Brand />
          </div>
          <p>Homemade prickly pear and mesquite bean jellies and cinnamon rolls by Lisha Hall, made in small batches when the harvest allows.</p>
        </div>
        <nav>
          {PAGES.map((p) => (
            <Link key={p.to} to={p.to}>
              {p.label}
            </Link>
          ))}
          <Link to="/contact">Contact Me</Link>
        </nav>
      </div>
      <p className="footer-fine">© {YEAR} Rare Tastes of Texas</p>
    </footer>
  )
}
