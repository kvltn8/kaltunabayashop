import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" aria-hidden="true">
      <path
        d="M6 8h12l-1.1 11.2a2 2 0 0 1-2 1.8H9.1a2 2 0 0 1-2-1.8L6 8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M9 8V6.5a3 3 0 0 1 6 0V8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="nav-mark">
          <span className="nav-mark-title">Kaltun's</span>
          <span className="nav-mark-sub">Abaya Shop</span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            Catalog
          </NavLink>
          {user ? (
            <button className="nav-link-btn" onClick={logout}>
              {user.first_name || user.username}, sign out
            </button>
          ) : (
            <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
              Sign in
            </NavLink>
          )}
          <Link to="/cart" className="nav-cart" aria-label={`Bag, ${itemCount} items`}>
            <CartIcon />
            {itemCount > 0 && <span className="nav-cart-count">{itemCount}</span>}
          </Link>
        </nav>
      </div>
    </header>
  );
}
