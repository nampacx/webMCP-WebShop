import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand" aria-label="Contoso Sports home">
          <span className="brand-mark">◈</span>
          <span className="brand-text">
            Contoso<span className="brand-accent">Sports</span>
          </span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Catalog
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="cart-link">
              Cart
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </span>
          </NavLink>
        </nav>

        <div className="nav-account">
          {isAuthenticated ? (
            <>
              <NavLink to="/profile" className="nav-user">
                Hi, {user.name.split(' ')[0]}
              </NavLink>
              <button className="btn btn-ghost" onClick={handleLogout}>
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
