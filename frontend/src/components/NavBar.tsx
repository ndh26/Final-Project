import { Link, NavLink } from 'react-router-dom'
import Brand from './Brand'
import { PAGES } from '../siteLinks'

// Every page is always listed; on narrow screens the links wrap onto a row under the brand.
export default function NavBar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <Brand />
        </Link>
        <nav className="nav-links">
          {PAGES.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to="/contact"
            className={({ isActive }) => ['nav-cta', isActive ? 'active' : ''].join(' ').trim()}
          >
            Contact Me
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
